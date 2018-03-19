window.acc = window.Acc = {
	user: false,
	avatar: new Image,
	onAvatar: [],
	u: {},
	uN: {},
	users: function(ids, cb){
		if(typeof ids != 'object') return false;

		var find = [],
			 fNames = [];
		ids.forEach(function(id, i){
			if(isNaN(id)){
				if(!acc.uN[id])
					fNames.push(id);
			}
			else{
				if(!acc.u[id])
					find.push(id);
			}
		});

		if(find.length || fNames.length)
			W({
				cmd: 'users',
				filter: {$or :[{id: {$in: find}}, {name: {$in: fNames}}]}
			}, function(r){
				r.users.forEach(function(u){
					acc.u[u.id] = u;
					acc.uN[u.name] = u;
				});
				cb(acc.u);
			});
		else cb(acc.u);
	},

	fullName: function(user){
		var title = user.fullName || ((user.firstName || '')+' '+(user.lastName || ''));
		if(title.length < 3) title = user.name || user.email || user.id;
		return title;
	},

	updateList: function(users){
		users.forEach(function(u){
			acc.u[u.id] = u;
			acc.uN[u.name] = u;
		});
	},

	on: [],
	ok: function(user){
		if(user) acc.user = user;

		$('#acc').show();

		if(user.avatar)
			$('#user-avatar').css('background-image', 'url('+Cfg.files+user.avatar+')');


    var title = user.title || user.fullName || (user.firstName || '')+' '+(user.lastName || '');
    if(title.length < 3) title = user.name || user.email || user.id;

		$('#fullName').text(acc.user.fullName || acc.user.name || acc.user.firstName || acc.user.email);

		$('.a').show();
		$('.na').hide();

		if(user.super)
			$('.super').show();

		acc.u[acc.user.id] = acc.user;
		acc.uN[acc.user.name] = acc.user;
		acc.on.forEach(function(f){
			f(acc.user);
		});
	},

	off: [],
	out: function(){
		console.log('out');
		$('.na').show();
		$('.a').hide();
		acc.user = false;
		Cookies.remove('sid');

		$('.super').hide();

		acc.off.forEach(function(f){
			f();
		});
	}
}


Site.on.session = function(p){
	Cookies.set('sid', p[1], {path: '/'});
};

Site.ready.push(function(sid){
	$('#user-auth').attr('src', Cfg.auth.avatar+'?sid='+sid);
});

$(function(){
	$('.a,.super').hide();

	if(Acc.user) Acc.ok();

	$('#authentication-new').click(ev => {
		Site.openApp('registration');
	});

	$('#user-login').click(function(){
		window.open(Cfg.auth.site+'#'+Site.sid, '_blank');
	});


	$('#avatar').click(function(){
		$('#uplAvatar').click();
	});


	$('#acc-logOut').click(function(){
		Acc.out();
	});


	$('.a').hide();

	ws.on.acc = function(m){
		acc.ok(m.user);
		//tip.hide();
	}

	ws.on.updateProfile = function(m){
		if(m.profile && Acc.user)
			Acc.user = m.profile;
	}
});
