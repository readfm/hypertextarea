window.Pix8 = {
  init: function(cfg){
    cfg = $.extend({

    }, cfg);

    if($('#pic').length) return;

    var $pic = Pix.$pic = Pix8.$pic = Pix8.$cont = $("<div>", {id: 'pic', class: 'bar'}).prependTo('body');

    var $header = Pix8.$header = $("<div>", {id: 'pix8-header'}).prependTo($pic);
    var $title = $("<div>", {id: 'pic8-title'}).appendTo($header);
    var $url = $('<input>', {placeholder: 'URL', id: 'pix8-url'}).appendTo($title);
    $url.bindEnter(function(ev){
      $('#browser-window').attr('src', this.value);
    });

    Pix8.initInput();
    Pix8.initList();
    if(window.isElectron)
      Pix8.iniElectron();

  },

	resize: function(){
		var height = $('#pic').height();

    var h = 0;
    $('#pic > *:visible').each(function(){
      console.log($(this).css('position'));
      if($(this).css('position') != 'absolute')
        h += $(this).height();
    });
    $('#pic').height(h);
		//chrome.storage.local.set({height: height});
		//chrome.runtime.sendMessage({cmd: 'resize', height: height});
		//Pix.leaveGap(height);
	},

  initInput: function(){
    var $resize = $("<div id='pic-resize'></div>");
    $resize.appendTo(Pix8.$pic);

    var $tag = Pix.$tag = Pix8.$tag = $("<input id='pic-tag'/>").appendTo($resize);
    $tag.bindEnter(function(){
      var carousel = Pix.carousel(this.value);
      this.value = '';

      if(false && window.isElectron)
        window.resizeBy(0, carousel.$t.height())
    }).click(function(){
      $tag.focus();
    });


    this.enableInputDrag();
  },

  iniElectron: function(){
    var window = require('electron').remote.getCurrentWindow();

    $("<button>", {id: 'pic8-devTools'}).click(ev => {
      window.toggleDevTools();
    }).html('&lt;&gt;').appendTo(Pix8.$header);

    $("<button>", {id: 'pic8-minimize'}).click(ev => {
      window.minimize();
    }).html('&minus;').appendTo(Pix8.$header);


    $("<button>", {id: 'pic8-close'}).click(ev => {
      window.close();
    }).html('&#10005;').appendTo(Pix8.$header);
  },

  enableInputDrag: function(){
    var $pic = Pix8.$pic;
    jQuery.event.special.drag.defaults.not = '';
    this.$tag.drag("start", function(ev, dd){
    	dd.height = parseInt($('#pic').height());
    	var $carousel = Pix8.$pic.children('.carousel').last();
    	dd.carouselHeight = $carousel.height();
    	dd.left = $carousel[0].scrollLeft;
    	dd.clientX = ev.clientX;
    	dd.done = 0;
    }, {click: true}).drag(function(ev, dd){
    	var onTop = !($pic.css('top') == 'auto'),
    			delta = dd.deltaY * (onTop?1:(-1));

    	var dif = dd.deltaY - dd.done;
    	dd.done = dd.deltaY;

    	var $carousel = $pic.children('.carousel').last(),
    			carousel = $carousel[0].carousel;

    	var height = $carousel.height() + dif;
    	if(height){
    		$carousel.height(height);
    		carousel.resize();
    	}
    	else
    		carousel.$t.remove();

    	var newL = (dd.left + dd.clientX) * carousel.$t.height() / dd.carouselHeight,
    		dif = newL - dd.left - dd.clientX;
    	carousel.t.scrollLeft = dd.left + dif;
    }).drag("end", function(ev, dd){
    	Pix8.resize();
    	//onScroll();
    });
  },

  linkView: function(view){
    Data.log(view.id + ' ' + view.tag, User.item.words_id);
    this.addTag(view.id, view.tag);
  },

  initList: function(){
    var $cont = this.$Pix8list = $('<div>', {id: 'pix8list'}).appendTo('#pic');

    $("<button>", {id: 'pic8-openMenu'}).click(ev => {
      $cont.toggle();
    }).html("&#8803").prependTo(Pix8.$header);

    this.initWords();
  },

  initWords: function(){
    var $cont = this.$Pix8list_words = $('<div>', {id: 'pix8list_words'}).appendTo(this.$Pix8list);

    Pix8.loadWords();
  },

  words: {},
  loadWords: function(id){
    Data.load(id).then(item => {
      if(item && item.length)
        item.forEach(line => {
          var l = line.split(' ');
          this.words[l[1]] = l[0];

          Pix8.addTag(l[0], l[1]);
        });

      Pix.carousel(Cfg.name || 'pix8');

      Pix8.resize();
    });
  },

  addTag: function(id, text){
    var $item = this.buildTag(id, text);
    this.words[text] = id;
    $('#pix8list_words').prepend($item);
  },

  buildTag: function(id, text){
    var $item = $('<a>');
    $item.text(text).data({id, text});
    $item.click(Pix8.clickTag);
    return $item;
  },

  clickTag: function(ev){
    var item = $(this).data();
    var carousel = new Carousel({
      name: item.text,
    });


  	var $carouselLast = $('#pic > .carousel').last();

    console.log($carouselLast[0]);

    carousel.$t.insertAfter($carouselLast[0] || $('#pix8-header'));
    carousel.onTag(item.text);
    Pix8.resize();
  },

  addWord: function(){

  }
};
