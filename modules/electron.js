$("<link>", {
  "rel" : "stylesheet",
  "type" :  "text/css",
  "href" : "electron.css"
}).appendTo('head');


$(ev => {
  var $pic = Pix.$pic = $("<div>", {id: 'pic', class: 'bar'}).prependTo('body');

  var $header = $("<div>", {id: 'pix8-header'}).prependTo($pic);
  $("<button>", {id: 'pic8-openMenu'}).html("&#8803").appendTo($header);
  $("<div>", {id: 'pic8-title'}).appendTo($header);


  var window = require('electron').remote.getCurrentWindow();
  $("<button>", {id: 'pic8-minimize'}).click(ev => {
    window.minimize();
  }).html('&minus;').appendTo($header);
  $("<button>", {id: 'pic8-maximize'}).click(ev => {
    if(!window.isMaximized())
      window.maximize();
    else
      window.unmaximize();
  }).html('&sdotb;').appendTo($header);
  $("<button>", {id: 'pic8-close'}).click(ev => {
    window.close();
  }).html('&times;').appendTo($header);


  var $resize = $("<div id='pic-resize'></div>");
	$resize.appendTo($pic)

  Pix.carousel('pix8');
  Site.resize();

  var $tag = Pix.$tag = $("<input id='pic-tag'/>").appendTo($resize);
  $tag.bindEnter(function(){
    Pix.carousel(this.value);
    this.value = '';
  }).click(function(){
    $tag.focus();
  });


  $(window).resize(function(event){
    var $lastCarousel = $('#pic > .carousel').last();
    $lastCarousel.height($lastCarousel.height() + document.body.clientHeight - $('#pic').height());
    $lastCarousel[0].carousel.resize();
  });

  document.addEventListener("keydown", e => {
    if (e.which === 123)
      require('remote').getCurrentWindow().toggleDevTools();
    else if (e.which === 116)
      location.reload();
  });
});
