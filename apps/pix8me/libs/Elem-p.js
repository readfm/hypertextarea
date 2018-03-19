window.Elems = {
	items: {},

	set: function(id, set){
		W({
			cmd: 'update',
			id: id,
			set: set,
			collection: Cfg.collection
		}, function(r){

		});
	},

	init: () => {
		$('<div>', {id: 'elems'}).hide().appendTo('body');
		//Elems.loadConstructs('article');

		$(document).ajaxComplete(ev => {

		});
	}
};

var module = window.Elem = function(item, cfg){
	var t = this;
	//var id = img.src.split('/').pop();

  $.extend(t, {
		noSort: true
  }, cfg);

  this.build(item);
};

$.extend(module.prototype, {
	fileDomains: [
		'http://f.io.cx/',
		'https://f.io.cx/',
		'http://files.mp3gif.com/'
	],

	build: function(item){
		var t = this;

		if(typeof item == 'string' || typeof item == 'number')
			item = Elems.items[item];
		if(!item) return;

		t.item = item;

		var file = item.file;
		if(!file && item.src){
			this.fileDomains.forEach(function(f){
				if(item.src.indexOf(f) === 0)
					file = item.src.substr(f.length);
			});
		}

		this.file = file;

		var $item = t.$item = $('<span>', {id: 'item-'+item.id, class: 'item'});
		$item.data(item);

		$item[0].elem = this;

		if(item.type == 'image'){
			if(item.src)
				t.thumbnail();
			else
			if(item.file)
				item.src = Cfg.files + item.file;


			if(t.youtube()){}
			else
			if(file){
				$item.addClass('file');
				$item.css({'background-image': "url("+Cfg.thumber+item.src.replace('://', '/')+")"});
				//t.loadFile(file);
			}
			else
				t.image();
		}
		else
		if(item.type == 'link'){
			t.thumbnail();
			t.image();

			if(item.title)
				$('<article>').text(item.title).css({
					opacity: 1,
					color: 'white',
					'box-shadow': 'none'
				}).appendTo($item);

			$item.attr('title', item.link);
		}
		else
		if(item.type){
			var type = item.type;
			if(type == 'text') type = 'article';

			require(['elem-constructs/'+type], mod => {
				mod.build($item);

				if(t.isAdmin)
				 	t.makeAdmin();

				var scrollable = $item.parent()[0].scrollable;
				if(scrollable) scrollable.reset();
				console.log(scrollable);
			});
		}

		/*
		if(item.width && item.height){
			$thumb.css({
				width: parseInt($thumb.css('height'))*item.width/item.height
			});
		};
		*/

		/*
		if(!this.noSort)
			$item.sortable(function(){
				Images.dragged($item);
			});

		if(!this.noRemove)
			$item.drag("start", function(ev, dd){
				$('#remove').fadeIn('fast');
			}).drag("end", function(){
				$('#remove').fadeOut('fast');
			});
		*/

		return $item;
	},

	makeAdmin: function(){
		var t = this;

		var $contenteditables = t.$item.find('.contenteditable');

		var $turnMenu = $('<div>', {class: 'item-turnMenu'}).html('&#9776;').appendTo(this.$item);
		var $turnEdit = $('<div>', {class: 'item-turnEdit', title: 'Edit mode on/off'}).html('&#10000;').appendTo(this.$item);
		$turnEdit.click(function(ev){
			$(this).toggleClass('on');

			$contenteditables.attr('contenteditable', $(this).hasClass('on'));
		});

		$contenteditables.on('focusout', function(ev){
			var set = {};
			set[$(this).data('db-arg')] = this.innerText;

			W({
				cmd: 'update',
				id: t.item.id,
				set: set,
				collection: t.collection
			});
		});


		//var $menu = $('<div>', {class: 'item-menu'}).appendTo(this.$item);
	},

	makeEditable: function(cfg){
		if(typeof cfg != 'object') return;
		if(!cfg.$field) return;

		cfg.$field.attr('contenteditable', true);

		if(cfg.maxlength)
			cfg.$field.on('keydown paste', (event) => {
			var cntMaxLength = parseInt($(this).attr('maxlength'));

			if($(this).text().length === cntMaxLength && event.keyCode != 8)
				event.preventDefault();
			});
	},

	// give an URL and return direct address to that video iframe
	parseVideoURL: function(url){
		if(typeof url !== 'string') return;
	 	function getParm(url, base){
		      var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
		      var matches = url.match(re);
		      if (matches) {
		          return(matches[2]);
		      } else {
		          return("");
		      }
		  }

		  var retVal = {};
		  var matches;
		  var success = false;

		  if(url.match('http(s)?://(www.)?youtube|youtu\.be') ){
		    if (url.match('embed')) { retVal.id = url.split(/embed\//)[1].split('"')[0]; }
		      else { retVal.id = url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
		      retVal.provider = "youtube";
		      var videoUrl = 'https://www.youtube.com/embed/' + retVal.id + '?rel=0';
		      success = true;
		  } else if (matches = url.match(/vimeo.com\/(\d+)/)) {
		      retVal.provider = "vimeo";
		      retVal.id = matches[1];
		      var videoUrl = 'http://player.vimeo.com/video/' + retVal.id;
		      success = true;
		  }

		 return retVal;
	},

	thumbnail: function(){
		var thumb;


		if(this.item.src){
			if(this.item.src.indexOf('data:image')==0) return;

			var video = this.parseVideoURL(this.item.src);
		}

		if(video && video.provider == 'youtube')
			thumb = 'http://img.youtube.com/vi/'+video.id+'/sddefault.jpg';
		else{
			var u = this.item.src.split('://');
			thumb = Cfg.thumb+u[0]+'/'+u[1];
		}

		this.$item.css('background-image', 'url('+thumb+')');

		return this.$thumb;
	},

	image: function(){
		var image = new Image,
			$image = $(image).appendTo(this.$item);

		var t = this;

		if(this.item.file){
			image.src = Cfg.files+this.item.file;

			$(image).dblclick(function(){
				t.playAudio(image);
			});
		}
		else
		if(this.item.src)
			image.src = this.item.src;


		return image;
	},

	youtube: function(){
		if(this.item.src){
			var video = this.parseVideoURL(this.item.src),
				vid = video.provider;
		}

		if(!video || video.provider != 'youtube') return;

		var frame = document.createElement("iframe");
				frame.src = 'https://www.youtube.com/embed/'+video.id;
		this.$item.addClass('youtube').append(frame);
		this.$item.append("<div class='iframe-cover'></div>");

		return frame;
	},
});

$(function(){
	$(document).on('mouseleave', '.ggif,.youtube', function(ev){
		$(this).children('.iframe-cover').show();
	});

	$(document).on('click', '.iframe-cover', function(ev){
		$(this).hide();
	});

	Elems.init();
});
