$.fn.scrollable = function(conf){
  var cfg = {
  }
  $.extend(cfg, conf);

  var $content = $(this).css({overflow: 'hidden'}).addClass('scrollable'),
      contentHeight = $content[0].clientHeight;

  var $bar = $('<div>', {class: 'scrollbar'}).insertAfter($content);

  var api = {
    reset: () => {
      var height = Math.pow($content[0].clientHeight, 2) / $content[0].scrollHeight;
      $bar.height(height);
      return height;
    }
  };
  $content[0].scrollable = api;
  api.reset();

  var scroll = px => {
    $content[0].scrollTop = px;
  };

  $bar.drag(function(ev, dd){
    var prc = dd.offsetY / (contentHeight);

    if(dd.offsetY<0 || dd.offsetY > (contentHeight - $bar.height())) return;
    $bar.css({
      top: dd.offsetY
     });

    $content[0].scrollTop = $content[0].scrollHeight * prc;
  });

  $content.mousewheel(function(ev){
    //console.log(ev);
    var y = $content[0].scrollTop + ev.deltaY * -30;

    $bar.css({
      top: y / contentHeight
    });

    scroll(y);
  });

  return api;
}
