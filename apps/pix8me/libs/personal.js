Acc.on.push(function(user){
	console.log(user);
});

window.Personal = {
	// prepare DOM for displaying user info.
	prepare: function(user){
		Personal.user = user;
		Personal.id = user.id;

		if(user.avatar)
			$('#avatar').css('background-image', 'url('+Cfg.files+user.avatar+')');

		if(user.cover)
			$('#cover').css('background-image', 'url('+Cfg.files+user.cover+')');

		$('#title, title').text(user.title || user.fullName || user.name || ('#'+user.id));


		$('#intro').val(user.intro || '')

		$('#info > .item').each(function(){
			var $item = $(this),
				item = $item.data(),
				$cont = $item.children('.content');

			var field = item.field;
			if(!field) field = $item[0].id.split('-')[1];

			console.log(field);
			if(user[field]){
				$cont.text(user[field]);
				$item.show();
			}
			else
				$item.hide();
		});

		Personal.load();
	
		Personal.resize();

		Personal.ready.forEach(function(f){
			f(user);
		});
	},
	ready: [],

	build: function(item){
		if(!item.description && (!item.images || !item.images.length)) return;

		var $card = $('<div>', {id: 'item-'+item.id, class: 'ui card item'});
		$card.data(item);

		var $image = $('<div>', {class: 'image'}).appendTo($card);

		var tryBig;
		var image = new Image;
		image.onload = function(){
			$image.append(image);
		}
		image.onerror = function(){
			if(!tryBig){
				tryBig = 1;
				if(!item.images[0]) return;
				image.src = Cfg.files+item.images[0];
			}
		}
		if(item.thumb) image.src = Cfg.files+item.thumb;
		else if(item.images && item.images[0])
			image.src = ((item.images[0]+'').indexOf('http://')+1)?item.images[0]:(Cfg.files+item.images[0]+"/thumb");




		var $content = $('<div>', {class: 'content'}).appendTo($card);

		if(item.title){
			var $header = $('<div>', {class: 'header'}).appendTo($content);
			$header.text(item.title);
		}

		var $description = $('<div>', {class: 'description'}).appendTo($content);
		$description.text(item.description || item.desc);


		var date_ago = 'sfds';//Sugar.Date.create(item.time).relative();
		/*
		var $extra = $('<div>', {class: 'exta content'}).appendTo($card);
		$('<span>', {class: 'right floated'}).text(date_ago).appendTo($extra);
		*/


		var $ctrl = $('<div>', {class: 'ui three bottom attached buttons'}).appendTo($card);

		var $btnQueue = $('<div>', {class: 'ui button'}).text('Queue').appendTo($ctrl);
		$('<i>', {class: 'add icon'}).prependTo($btnQueue);

		var $btnPlay = $('<div>', {class: 'ui primary button'}).text('Open').appendTo($ctrl);
		$('<i>', {class: 'play icon'}).prependTo($btnPlay);


		var $btnTime = $('<div>', {class: 'ui button'}).text(date_ago).appendTo($ctrl);
		$('<i>', {class: 'checked calendar icon'}).prependTo($btnTime);

		return $card;
	},

	load: function(){
		ws.send({
			cmd: 'load',
			collection: 'tree',
			filter: {
				owner: Personal.id
			},
			sort: {
				time: -1
			},
			limit: 200
		}, function(r){
			var $catalog = $('#catalog').show(),
				$items = $('#catalog-items').empty();

			(r.items || []).forEach(function(item){
				var $item = Personal.build(item);

				if($item)
					$items.append($item);
			});
		});
	},

	resize: function(){
		var pad = parseInt($('.app:visible').css('margin-top')) || 400,
			top = document.body.scrollTop,
			size = Math.max(pad - top, 100),
			limit = 100,
			isLimit = size <= limit;

		//console.log(pad+' - '+top+' = '+size);

		Personal.$header.outerHeight(size);

		var bottomAvatar = Personal.$avatar.position().top + Personal.$avatar.height();
		//Personal.$filters.css('left', (Personal.$filters.position().top<bottomAvatar)?120:0);

		$('#intro')[(size > bottomAvatar)?'show':'hide']();

		var bottomInfo = Personal.$info.position().top + Personal.$info.height();
		var sizeForInfo = 150,
			showInfo = sizeForInfo<size;
		Personal.$info[showInfo?'fadeIn':'hide']();
		Personal['$menu-info'][(!showInfo)?'fadeIn':'fadeOut']('fast');

		Personal.$cover.css('opacity', size<150?0.1:1);
	},

	checkAdmin: function(){
		console.log('checkAdmin');
		if(!Acc.user || !Personal.id || Acc.user.id != Personal.id) return;
		if(!Personal.admin) $.getScript('/modules/admin.js');
		Personal.admin = true;
	}
}

Site.ready.push(function(){
	var name = document.location.hostname.split('.').reverse()[2];
	if(!name) return console.error('No name');

	ws.send({
		cmd: 'get',
		collection: 'acc',
		filter: {
			name: 'mnts'
		}
	}, function(r){
		var user = r.item;
		if(!user) return console.error('Username not found');
		window.User = user;
		console.log(user);
		Personal.prepare(user);
	});
	Personal.resize();
});

Acc.on.push(Personal.checkAdmin);
Personal.ready.push(Personal.checkAdmin);

$(function(){
	Personal.$header = $('#header');
	Personal.$cover = $('#cover');
	Personal.$avatar = $('#avatar');
	Personal.$info = $('#info');
	Personal['$menu-info'] = $('#menu-info');
	Personal.$filters = $('#filters');

	$(window).scroll(function(){
		Personal.resize();
	});

	$(window).resize(function(){
		Personal.resize();
	});
	Personal.resize();

	$('#toggleInfo').click(function(){
		$('#info').dropdown('toggle');
	});
});