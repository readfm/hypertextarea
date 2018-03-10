(function(){
  var src = $('head > script').last().attr('src');
  $('<link>', {href: src.slice(0, -2)+'css', rel: "stylesheet"}).appendTo('head');
})();

define({
  build: function($item){
    var item = d = $item.data();

    $item.addClass('construct-article');

    var $thumb = $('<div>', {class: 'thumb'}).appendTo($item),
        $title = $('<h2>', {class: 'pref-title contenteditable'}).appendTo($thumb);
        $timeBlock = $('<p>', {class: 'pref-timeBlock'})
          .append('<i class="fa fa-clock-o"></i>&nbsp;')
          .appendTo($item),
        $time = $('<span>', {class: 'pref-time'}).appendTo($timeBlock);
        $desc = $('<p>', {class: 'desc contenteditable'}).appendTo($item);

    $title.data('db-arg', 'title');
    $desc.data('db-arg', 'description');

    if(d.title)
      $title.text(d.title);

    $title.text(d.title || d.name);
    $desc.text(d.description);

    $time.text(Date.create(d.time).format('{Weekday} {d} {Month}, {yyyy}'));

    $thumb.click(ev => {
      require(['previews/article'], mod => {
        mod.open($item);
      });
    });


    var tryBig;
    var image = new Image;
    image.onload = function(){
      $thumb.css('background-image', "url("+image.src+")");
    }
    image.onerror = function(){
      if(!tryBig){
        tryBig = 1;
        image.src = "/"+d.images[0];
      }
    }

    if(d.thumb) image.src = Cfg.files+d.thumb;
    else if(d.images && d.images[0])
      image.src = ((d.images[0]+'').indexOf('http://')+1)?d.images[0]:(Cfg.thumber+'fid/'+d.images[0]);

    return $item;
  }
});
