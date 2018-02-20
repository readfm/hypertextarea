(function(){
  var site;
  var scripts = document.getElementsByTagName('script');
  for(var i = scripts.length - 1; i >= 0; --i){
  	var index = scripts[i].src.indexOf('pix8.js')
  	if(index+1)
  		site = scripts[i].src.substr(0, index);
  }

  var script;

  var loaded = 0,
      libs = [
        'config.js',
        'lib/ws.js', 'lib/functions.js', 'lib/omggif.js', 'lib/gif.js', 'lib/Elem.js',
        'pix8/carousel.css', 'pix8/GG.css',
        'pix8/carousel.js', 'pix8/pix.js', 'pix8/pix8list.js', 'pix8/integrate.js', 'pix8/GG.js'
      ],
      loads = [];

  if(typeof jQuery != 'function')
    libs.unshift('lib/jquery.js', 'lib/jquery.event.drag.js', 'lib/jquery.event.drop.js');

  if(typeof Cookies != 'function')
    libs.unshift('lib/js.cookie.js');


  libs.forEach(function(lib){
    loads.push(function(){
      var ext = lib.split('.').pop();
      tag = document.createElement(ext == 'css'?'link':'script');
      tag[ext == 'css'?'href':'src'] = site+lib;

      if(ext == 'js') tag.setAttribute('async', '');
      if(ext == 'css'){
        tag.setAttribute('type', 'text/css');
        tag.setAttribute('rel', 'stylesheet');
      }

      tag.onload = function(){
        console.log('Loaded: ' + lib);
        loaded++;
        if(loaded < libs.length)
          loads.shift()();
        else
          console.log('done');
      };

      tag.onerror = function(){
        console.log('Error: ' + lib);
        loaded++;
        loads.shift()();
      };

      document.head.appendChild(tag);
    });
  });
  loads.shift()();
})();
