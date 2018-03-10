var module = window.Catalogem = function(cfg){
	var t = this;
	//var id = img.src.split('/').pop();

  $.extend(t, {
  }, cfg);

  this.init();
};

$.extend(module.prototype, {
  init: function(){
    this.$cont = $('<div>', {class: 'stack'});
    this.$filters = $('<div>', {class: 'catalog-filters'}).appendTo(this.$cont);
    this.$items = $('<div>', {class: 'catalog-items'}).appendTo(this.$cont);
  },

	filters: {
		click: function(fltr){
			var $filter = $('<span>', {class: 'catalog-filter'});
      $filter.text(fltr.text);
      $filter.appendTo(this.$filters);
      $filter.click(function(){
        if(fltr.onClick == 'deactivate siblings'){
          $filter.siblings('.active').removeClass('active');
          $filter.addClass('active');
					t.$active = $filter;
          t.reload();
        }
      });

			return $filter;
		},

		input: function(fltr){
			var $filter = $('<div>', {class: "ui icon input"});

			$('<input>', {type: "text", placeholder: "Search..."}).appendTo($filter);
			$('<i>', {class: "search icon"}).appendTo($filter);

			return $filter;
		},

		range: function(fltr){

		},

		check: function(fltr){

		},

		option: function(fltr){

		},

		options: function(fltr){
			var $filter = $('<div>', {class: "ui selection dropdown"});

			$('<input>', {type: 'hidden', name: 'gender'}).appendTo($filter);
			$('<i>', {class: 'dropdown icon'}).appendTo($filter);
			$('<div>', {class: 'default text'}).appendTo($filter).text(fltr.default || '');

			var $menu = $('<menu>', {class: 'menu'}).appendTo($filter);

			(fltr.options || []).forEach(option => {
				if(typeof option == 'string')
					option = {text: option};

				var $option = $('<div>', {class: 'item'}).text(option.text);
				$option.data(option); 	//data-value
				$option.appendTo($menu);
			});

			$filter.dropdown();

			return $filter;
		},

		select: function(fltr){

		},
	},

	addFilter: function(fltr){
    var t = this;
    if(fltr instanceof jQuery){

    }
    else
    if(typeof fltr == 'string'){

    }
    else
    if(typeof fltr == 'object'){
			var filter = this.filters[fltr.name];
			if(!filter) return;

			var $filter = filter(fltr);

      if(fltr.active)
        $filter.addClass('active');

      $filter.data(fltr);

			$filter.appendTo(this.$filters);

      return $filter;
    }
  },

  query: function(q){
    var t = this;
    return new Promise(function(resolve, reject){
      this.ws.send($.extend({
        cmd: 'load',
        collection: t.collection,
      }, q), resolve);
    });
  },


  filter: {},
  collectFilters: function(filter){
    filter = $.extend(this.filter, filter);

    return filter;
  },

  sort: {},
  collectSort: function(sort){
    sort = $.extend({}, this.sort, sort);

    this.$filters.children('.active').each(function(){
      var data = $(this).data();

      if(data.sort){
        $.extend(sort, data.sort);
        console.log(data.sort);
      }
    });

    return sort;
  },

  reload: function(){
    var t = this;

		return new Promise(function(resolve, reject){
	    t.find().then(function(items){
	      t.$items.empty();
	      t.arrange(items);
				console.log('reloadddd');
				resolve(items);
	    });
		});
  },

  limit: 200,

	find: function(){
    var t = this;


		return new Promise(function(resolve, reject){
			if(t.$active && t.$active.data('filter') == false)
				return t.$items.empty();

			t.query({
				filter: t.collectFilters(),
				sort: t.collectSort(),
				limit: t.limit,
			}).then(function(r){
				resolve(r.items);
			});
		});
	},


	// place elements
  arrange: function(items){
    var t = this;
    (items || []).forEach(function(item){
      if(t.skipIf && t.skipIf(item)) return;

      var $item = t.build(item);

      $item.appendTo(t.$items);
    });
  }
});
