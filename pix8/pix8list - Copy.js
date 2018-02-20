window.Pix8list = {
  home: (document.location.host.indexOf('.lh')+1)?'http://io.lh/':'http://io.cx/',
  init: function(){
    $('<input>', {id: 'pix8-title', disabled: 'disabled'}).prependTo('#pic').val($('title').text());
    $('#mainCarousel > .carousel-tag').hide();

    var catalog = this.catalog = new Catalog({
      build: this.buildLink,
      collection: Cfg.collection,
      ws: ws,

      filter: {
        youtube_id: { $exists: true},
        text: { $exists: true},
        type: 'image',
      }
    });

    catalog.$cont.attr({
      id: 'pix8list'
    }).appendTo('#pic');

    catalog.$filters.attr({
      id: 'pix8list-filters'
    });

    catalog.$items.attr({
      id: 'pix8list-items'
    });

    this.initFilters();

    $('<span>', {id: 'pix8list-toggle'}).text('=').prependTo('#pic').click(function(){
      catalog.$cont.toggle();

      if(catalog.$cont.is(':visible'))
        catalog.reload();
    });

    if(Pix.extension){
      var height = parseInt($('#pic').height());
      Pix.leaveGap(height);
    }
  },

  buildLink: function(item){
		var $item = $('<div>', {title: item.yid, id: 'twext_'+item.id});

		$item.data(item);

		$item.text(item.text || item.segments.replace(/\-/g, ''));
    $item.click(function(){
      GG.load(item);
    });

		return $item;
	},

  initFilters: function(){
    this.catalog.addFilter({
      text: 'gg',
      active: true,
      sort: {
        updated: -1,
        time: -1
      },
      onClick: 'deactivate siblings'
    });
  }
};

$('<link>').attr({
    type: 'text/css',
    rel: 'stylesheet',
    href: Pix8list.home+'pix8/pix8list.css'
}).appendTo('head');

Pix.ready.push(function(){
  Pix8list.init();
});
