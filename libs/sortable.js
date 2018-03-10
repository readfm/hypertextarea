var drag = {
	start: function(e){
		drag.$ = $(this).addClass('drag');
		drag.type = drag.getType(drag.$);

		e.dataTransfer.setData('fp', true);
		drag.fp = drag.$.index();
	},

	enter: function(){
		var $el = $(this);
		if(drag.$ && drag.getType($el) == drag.type)
			if(drag.$[0] != $el[0])
				drag.$['insert'+(drag.$.index()<$el.index()?'After':'Before')]($el);
		return false;
	},

	getType: function($el){
		if($el.hasClass('thumb'))return 'thumb';
		else return false;
	},

	cancel: function(e){
		if(e.preventDefault) e.preventDefault();
		e.dataTransfer.dropEffect = 'copy'; // tells the browser what drop effect is allowed here
		return false; // required by IE
	},

	// when slide its should have some momentum
	motion: function(amplitude, carousel){
		carousel.stop = 0;

		var timeConstant = 325,
			timestamp = Date.now();

		function step(stamp){
			if(carousel.stop) return;

			var elapsed = timestamp - Date.now();
			var delta = amplitude * Math.exp(elapsed / timeConstant);
			carousel.scrollLeft = carousel.scrollLeft + Math.round(delta);

			if(delta>0.7 || delta<-0.7)
				window.requestAnimationFrame(step);
			else{}
		}

		window.requestAnimationFrame(step);
	}
}

$.drop({
	tolerance: function(event, proxy, target){
		return this.contains( target, [ event.pageX, event.pageY ] );
	},
});

$.fn.sortable = function(cb){
	return this.each(function(){
		var $thumb = $(this),
		t = this,
		move = false,
		slide = false,
		tw = $thumb.width()+1,
		th = $thumb.height();

		var t = this;

		// remove previously associeted data by drag&drop lib.
		$thumb.off().removeData(['dragdata', 'dropdata']).click(function(){
			var o = $(this).offset();

			if(move) move = false;
			else{
				$(this).children('.iframe-cover').hide();
				var url = $(this).data('href');
				if(!url) return;
			}
		}).drag("init", function(ev, dd){
			console.log(dd);
		}).drag("start", function(ev, dd){
			dd.startParent = this.parentNode;

			dd.index = $(this).index();

			var $cont = $('#images');//$(this).parent();
			var $thumbd = $(this).clone().appendTo($cont).hide();
			$thumbd.css({position: 'absolute', opacity: 0.7}).removeClass('selected');

         	dd.update();


         	dd.start = this.parentNode.scrollLeft;

			dd.mv = 0;
			dd.m = 0;

			dd.index = $(this).index();

			var timestamp = Date.now(),
   				frame = dd.offsetX;
			var now, elapsed, delta, v;
			dd.pulse = 0;

			intr = setInterval(function(){
				now = Date.now();
				elapsed = now - timestamp;
				timestamp = now;
				delta = dd.offsetX - frame;
				frame = dd.offsetX;

				v = 30 * -delta / (1 + elapsed);
				dd.pulse = 0.8*v + 0.2 * dd.pulse;
			}, 50);
			t.stop = 1;



         	if($thumb.hasClass('selected')){
         		var $selected = $('.item.selected');
         		if($selected.length > 1){
         			$thumbd.append("<div class='count'>"+ $selected.length +"</div>");
         			var ids = [];
         			$selected.each(function(){
         				var id = $(this).data('id')
         				if(id && ids.indexOf(id)<0) ids.push(id);
         			});

         			$thumbd.data('ids', ids);
         		}
			}
			return $thumbd;
		}).drag(function(ev, dd){
			var $proxy = $(dd.proxy);

			var dy = Math.abs(dd.deltaY),
				dx = Math.abs(dd.deltaX),
				isCarousel = $proxy.parent().hasClass('carousel');


			if((dy > 8 || (!isCarousel && dx > 8)) && !slide)
				$proxy.addClass('drag').show();

			var dragging = $proxy.hasClass('drag');

			if(dragging && !slide){
				$proxy.css({
					top: dd.offsetY,
					left: dd.offsetX
				});
				move = true;
			}else
			if(isCarousel){
				var x = dd.start - dd.deltaX;
				if(Math.abs(dd.deltaX) > 8 && dd.deltaX != 0)
					slide = dd.deltaX;

				this.parentNode.scrollLeft = Math.max(x, 0);
			}

	    	dd.update();
		},{ click: true, distance: 4}).drag("end", function(ev, dd){
			if(dd.pulse)
				drag.motion(dd.pulse, this.parentNode);

			if(!move) return;

			setTimeout(function(){
				move = false;
				slide = false;
			},100);

			$(dd.proxy).remove();

			var $thumb = $(this).removeClass('drop');
			$('.draggable').removeClass('draggable');

			var parent = $thumb.removeClass('drop').parent()[0];

			var ok = $(this).index() != dd.index;
			if(ok)
				if(cb) cb();
		}).drop("init",function(ev, dd){
			var $thumb = $(this);
			return !( this == dd.drag );
		}).drop("start", function(ev, dd){
			var $drag = $(dd.drag);
			if(!$drag.hasClass('item')) return;

			//console.log(this);
			var $thumb = $(this);
			//$('.drag').insertBefore();
			var ok = this != dd.drag;
			if(ok){

				var bfr = $thumb.index() <= $drag.index();

				$drag['insert'+((bfr)?'Before':'After')]($thumb);

				dd.update();
			}
			return ok;
		}).drop(function(ev, dd){
			//console.log(this);
		}).drop("end",function(ev, dd){
		});

	});
}
