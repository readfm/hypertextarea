var module = window.Profile = function(cfg){
	var t = this;
	//var id = img.src.split('/').pop();

  $.extend(t, {
  }, cfg);

  this.load();
};

$.extend(module.prototype, {
	load: function(){
		var fltr = {};

		if(this.id) fltr.id = this.id;
		else
		if(this.name) fltr.name = this.name;

		ws.send({
			cmd: 'get',
			collection: 'acc',
			filter: fltr;
		}, r => {
			var user = r.item;

			if(!user) return console.error('Username not found');

			this.user = user;
			this.id = user.id;
			this.name = user.name;

			this.setup(user);
		});
	},

  setup: function(user){
		
  },

	initInfo: function(user){

	},

	initMain: function(){

	},

	loadPages: function(){

	},

	layoutPages: function(){

	},

	laydownContacts: function(items){
		(items || []).forEach(function(item){
			var $item = $('<div>', {class: 'item'});
			$('<img>', {class: 'ui avatar image', src: Cfg.files+item.photo}).appendTo($item);
			$('<span>').text(item.title || item.name || ('#'+item.id)).appendTo($item);
		});
	}
});
