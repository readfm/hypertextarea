var mod = module.exports = global.WS = {
	sendOthers: function(room, id, msg){
		var isBuf = (msg instanceof Buffer),
			 ob = isBuf?{}:JSON.parse(msg);
		for(var i = 0; i < room.on.length; i++){
			var client = room.on[i];
			if(client &&  i != id){
				if(!(ob && ob.to > -1 && ob.to != i))
					try{
						client.send(msg, {binary: isBuf});
					}catch (e){
						console.log(e);
					}
			}
		};
	},

	connected: function(ws){
		var req = ws.upgradeReq;
		var path = require('url').parse(req.url),
			road = ws.road = decodeURI(path.pathname).replace(/^\/+|[^A-Za-z0-9_.:\/~ -]|\/+$/g, ''),
			host = ws.host = req.headers.host,
			url = ws.url = ws.host + '/' + road,
			p = ws.p = road.split(/[\/]+/),
			get = ws.get = require('querystring').parse(path.query) || {},
			ip = ws.ip = req.headers['x-forwarded-for'] ||
		     req.connection.remoteAddress ||
		     req.socket.remoteAddress ||
		     req.connection.socket.remoteAddress,
			cookie = ws.cookie = require('cookie').parse(req.headers['cookie'] || '');

		if(p[0])
			(SOCK[p[0]] || fake)(ws);
		else
			this.initConnection(ws);
	},

	sessions: global.Sessions || {},

	createSession: function(sid){
		var sid = sid || randomString(12);
		var session = this.Sessions[sid] = {
			created: (new Date).getTime(),
			sockets: [],
			sid: sid
		};
		return sid;
	},

	initConnection: function(ws){
		_.extend(ws, this.prototype);
		if(
			ws.cookie && ws.cookie.sid && Sessions[ws.cookie.sid] ||
			ws.get.sid && this.sessions[ws.get.sid]
		)
			ws.session = this.sessions[ws.get.sid || ws.cookie.sid];
		else{
			var sid = this.createSession();
			ws.session = this.sessions[sid];
		}

		ws.sid = sid || ws.cookie.sid;
		ws.RE = this.RE;

		ws.session.sockets.push(ws);

		ws.json(_.extend(_.pick(ws.session, 'sid', 'user'), {cmd: 'session'}));

		ws.on('message', this.onMessage);
		ws.on('close', this.onClose);
	},

	onMessage: function(msg){
		var ws = this;
		if(typeof msg == 'string'){
			// missing closure bug.
			var ls = msg.substr(-1);
			if(ls != '}' && ls != ']')
				msg += '}';

			var m = JSON.parse(msg);

			if(m.cb)
				ws.putCB(m);

			if(m.cmd){
				if(m.cmd == 'setSession')
					setSession(m.sid);

				var fn = global.API[m.cmd];
				if(fn){
					var cb = function(r){
						if(m.cb) RE[m.cb](r);
					};
					var r = fn(m, ws, cb);
				}
			}
		}
		else
		if(msg instanceof Buffer){
			if(!ws.stream) return ws.json({error: 'no stream'});

			ws.stream.write(msg, function(err){
				if(err) return console.log(clc.red(err.toString()));

				var tmpName = ws.stream.path.split('/').pop();
				ws.json({cmd: 'progress', b: ws.stream.bytesWritten});
			});
		}
	},

	onClose: function(code, msg){
		var ws = this;
		if(ws.session)
			ws.session.sockets.forEach(function(sock, i){
				if(sock == ws)
					ws.session.sockets.splice(i,1);
			});
	},

	prototype: {
		json: function(d){
			if(this.readyState !== 1) return;
			this.send(JSON.stringify(d));
		},

		error: function(ofCmd, msg, d){
			this.send(JSON.stringify(_.extend({cmd: 'error', ofCmd: ofCmd, msg: msg}, d)));
		},

		cb: function(cb, m){
			(this.RE[cb] || fake)(m);
		},

		putCB: function(m){
			var ws = this;
			this.RE[m.cb] = function(msg){
				var r = {cb: m.cb};
				_.extend(r, msg);
				ws.json(r);

				delete this.RE[m.cb];
			};

			setTimeout(function(){
				if(this.RE[m.cb]) delete this.RE[m.cb];
			}, 10 * 60 * 1000);
		}
	},

	RE: {},

	default: {
		port: 3000
	},

	init: function(h){
		var d = {};
		if(!h)
			d.port = Cfg.socket.port || this.default.port
		else
		if(typeof h == 'number')
			d.port = h;
		else d.server = h;

		var WebSocketServer = require('ws').Server,
			wss = new WebSocketServer(d);

		wss.on('connection', ws => {
			this.connected(ws);
		});
	}
};
