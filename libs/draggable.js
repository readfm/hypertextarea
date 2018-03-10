var drag = {
	start: function(ev){
		console.log('drg');
		drag.$ = $(this).addClass('drag');

		ev.dataTransfer.setData('fp', true);
		ev.dataTransfer.effectAllowed = "copyMove";

		drag.fp = drag.$.index();
	},

	enter: function(ev){
		var $el = $(this);
		event.dataTransfer.dropEffect = "copy";

			if(drag.$[0] != $el[0])
				drag.$['insert'+(drag.$.index()<$el.index()?'After':'Before')]($el);

		return false;
	},

	getType: function($el){
		if($el.hasClass('thumb'))return 'thumb';
		else return false;
	}
}

$.fn.draggable = function(cb){
	return this.each(function(){
		$(this).attr('draggable', true);

		this.addEventListener('dragstart', drag.start, false);
		this.addEventListener('dragenter', drag.enter, false);
		this.addEventListener("dragover", ev => {
			ev.preventDefault();
		}, false);

		this.addEventListener('dragend', function(){
			if(drag.$){
				drag.$.removeClass('drag');
				if(drag.$.index() != drag.fp)
					cb(drag.$);
				delete drag.$;
			};
			$('.drop').removeClass('drop');
		}, false);
	})
}
