var meta = {};
var domain = document.domain.toLowerCase(),
	host = domain.match(/[^.]+\.[^.]+$/);

window.site = window.Site = {
	title: $('title').text(),

	on: {},
	ready: [],
	page: function(selector){
		$('.page').hide();
		return $(selector).show();
	},

	apps: {},

	states: {
		editProfile: {
			title: 'Edit Profile',
			needAuth: true
		}
	},

	p: function(url){
		if(!url) url = window.location.pathname;
		url = url.replace(/^\/|\/$/g, '');
		var p = (url || '').split(/[\/]+/);
		return p;
	},

	setState: function(url){
		var p = site.p(url);
		var state = site.states[p[0]];

		history.pushState(_.pick(state, function(v){return typeof v != 'function'}), state.title,  '/'+url);
		site.openState(p);
	},


	pushState: function(url, title, state){
		if(!title) title = Site.title;
		history.pushState(state || {}, title,  url);
		$('title').text(title);
		//site.openState(p);
	},

	backState: function(){

	},

	openApp: function(name, cb){
		var onLoad = function(){
			if(name != 'review'){
				if(location.pathname.replace(/^\/|\/$/g, ''))
					Site.pushState('/');
			}

			if($('#'+name).hasClass('app')){
				$('.app').hide();
				$('#'+name).show();
			}

			var app = Site.apps[name];
			if(app && app.open)
				app.open();

			$(document).scrollTop(0);
			$('.modal, #modal').hide();

			if(cb) cb(app);
		};

		if($('#'+name).length)
			onLoad();
		else
			$.get('/apps/'+name+'.htm', function(r){
				$('body').append(r);
				var app = Site.apps[name];
				if(app && app.load) app.load();
				onLoad();
			});
	},

	load: function(ur){
		var ur = ur.replace(/[^A-Za-z0-9_.:\/~-]/,'').replace(/^\/|\/$/g, '')
		if(!ur) return acc.user?site.show('#dashboard'):0;
		var p = ur.split(/[\/]+/);

		(site.on[p[0]] || fake)(p);
	},

	openState: function(p){
		if(p.length){
			if(!p[0]) return Site.goHome();
			ws.send({cmd: 'tree.resolve', id: 0, path: p}, function(m){
				if(m.item)
					Review.display(m.item, 'tree');
				else
					site.goHome();
			});
		}
		else
			Site.goHome();
		return;

		var state = site.states[p[0]];
		if(!state) return site.goHome();

		if(state.needAuth && !acc.user) return ui.modal('#needAuth');
		if(!state.title) state.title = p[0];
		$('title').text(state.title);


		if(state.on) return state.on(p);
		var $page = $(state.selector || ('#app-'+p[0]));
		if($page.length){
			site.page($page);
			(state.onOpen || fake)(p);
		}
		else
			$.get('/parts/app-'+p[0]+'.htm', function(r){
				$('body').append(r);
				var $page = site.page('#app-'+p[0]);
				(state.onOpen || fake)(p);
			})
	},

	goHome: function(){
		$('#name').click();
	},
}


$(document).ready(function(){
	var sid = window.location.hash.replace('#', '') || Cookies.get('sid');
	var path = Cfg.api || document.domain;
	if(sid) path += '/?sid=' + sid;

	var ws = window.ws = window.W = Site.ws = window.Ws = new WS(path);
	ws.connection.onopen = function(){
	}

	window.S = ws.on;
	window.W = (msg, cb) => {ws.send(msg, cb)};

	S.session = function(m){
		Cookies.set('sid', m.sid);
		if(m.user) acc.ok(m.user);

		Site.sid = m.sid;
		Site.ready.forEach(function(f){
			f(m.sid);
		});

		site.openState(site.p(window.location.pathname));

		if(window.location.hash)
			site.load(window.location.hash.replace('#', ''));
	}

	S.error = function(m){
		if(m.ofCmd && S.error[m.ofCmd])
			S.error[m.ofCmd](m);
	}

	$(document).on('click', '.state', function(ev){
		site.setState($(this).attr('href'));
	});

	$(window).on('hashchange', function(){
		var psl = window.location.hash.replace('#', '');

		site.load(psl);
	});
});
