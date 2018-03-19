$(function(){
	$('.slider>.sl').drag("start", function(ev,dd){
		dd.limit = $(this).parent().outerWidth() - $(this).outerWidth() - 3;
		dd.fp = this.offsetLeft;
	}).drag(function(ev,dd){
		var l = Math.min(dd.limit, Math.max(0, dd.fp + dd.deltaX));
		$(this).trigger('updateValue', l);
	}).on('updateValue', function(ev, l){
		var $sl = $(this);
		this.style.left = l+'px';
		//$sl.parent().data('prec', (l-1) / (dd.limit - 1));
		$sl.parent().trigger('updateTube');
	});

	$('.slider').on('updateTube', function(){
		var $tube = $(this).children('.tube');
		if(!$tube.length) return;

		if($tube.prev().hasClass('sl'))
			$tube.css('left', $tube.prev().position().left);
		else $tube.css('left', 0);

		if($tube.next().hasClass('sl'))
			$tube.css('right', $tube.parent().width() - $tube.next().position().left);
		else $tube.css('right', 0);
	}).trigger('updateTube');

	$('.slider').on('reset', function(){
		var $tube = $(this).children('.tube');
		$(this).children('.sl:nth-of-type(1)').css('left', 0).text('');
		var $sl2 = $(this).children('.sl:nth-of-type(2)').text('');
		$sl2.css('left', $(this).innerWidth()-$sl2.innerWidth());
		$sl.parent().trigger('updateTube');
	});

	
	$(".range").tip({
		pos: 't',
		id: 'range'
	});

	var $sl = $('#range > .slider').children('.sl');
	$sl.drag(function(ev, dd){
		var $input = $('input.focus');
		var multiply = $input.data('multiply') || 1;
		var r1 = ($sl.eq(0).position().left || 0) * multiply;
		var r2 = $sl.eq(1).position().left * multiply;
		$sl.eq(0).text(r1);
		$sl.eq(1).text(r2);

		$('input.focus').val(r1+' - '+r2);
	});
});