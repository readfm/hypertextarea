$(function(ev){
	let sid = Cookies.get('sid');
  let path = Cfg.host;
  let port = Cfg.port;
  if(port) path += ':' + port;
	if(sid) path += '?sid=' + sid;

	var ws = window.ws = new WS({
    server: path,
    autoReconnect: true
  });
	window.S = ws.on;
  window.W = (m, cb) => ws.send(m, cb);

	S.session = m => {
		Cookies.set('sid', m.sid);
		User.id = m.my_id;

		Data.load(User.id).then(item => {
			User.item = item || {id: User.id};

 			Pix8.init();
		});
		//if(m.user) acc.ok(m.user);

		$(document).trigger('connected');
	}
});
