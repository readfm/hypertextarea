var fs = require('fs-extra');

global.FS = {
	save: function(f, cb){
		var file = {};

		_.extend(file, f);
		file.id = randomString(9);

		file.created = (new Date()).getTime();
		db.collection(cfg.fs.collection).insert(file, {safe: true}, function(e, r){
			if(cb) cb(r.ops[0]);
		});
	},

	locations: {},

	collection: db.collection(cfg.fs.collection)
}

global.SAVE = FS.locations;

sys.on('loaded', function(){
	sys.sockets2track = [];

	query.upload = function(q){
		var tmpName = randomString(20),
			 tmpPath = query.pathFiles+tmpName,
			 tmpStream = fs.createWriteStream(tmpPath, {flags: 'w'});
		q.req.pipe(tmpStream, {end: false});

		if(q.req.headers.track_id && q.req.headers.track_id){
			q.req.on("data", function(){
				sys.sockets2track[q.req.headers.track_id].send(JSON.stringify({
					_: 'track',
					id: q.req.headers.track_id,
					bytesWritten: tmpStream.bytesWritten,
				}));
			});
		}

		q.req.on("end", function(){
			tmpStream.end();

			if(q.get.track_id)
				delete sys.sockets2track[q.get.track_id];

			/*
			setTimeout(function(){
				if(fs.existsSync(tmpPath)){
					fs.unlink(tmpPath, ecb);
				}
			},60*60*1000);
			*/
			acc.auth(q, function(usr){
				var size = tmpStream.bytesWritten+tmpStream._writableState.length;

				if(q.p[0]){
					var id = parseInt(q.p[0]);
					db.collection(cfg.fs.collection).find({id: id}).toArray(function(err, data){
						if(!data || !data[0]) return q.end({error: 'file not found'});

						var file = data[0];
						if(file.owner && (!usr || usr.id != file.owner)) return q.end({error: 'access denied'});

						if(q.p[1] == 'thumb'){
							fs.renameSync(tmpPath, Thumb.path + file.id);
							q.end({size: size});
							return;
						}

						var set = {
							updated: (new Date()).getTime(),
							size: size
						};

						_.extend(file, set);

						fs.renameSync(tmpPath, file.path || (query.pathFiles + file.id));
						db.collection(cfg.fs.collection).update({id: file.id}, {$set : set}, function(){
							q.end({file: file});
						});
					});

					return;
				}

				var file = {
					id: randomString(9),
					size: size
				};

				if(usr)
					file.owner = usr.id;

				if(q.req.headers['x-name'])
					file.name = q.req.headers['x-name'];

				if(q.req.headers['x-mime'])
					file.mime = q.req.headers['x-mime'];

				file.created = (new Date()).getTime();
				db.collection(cfg.fs.collection).insert(file, {safe: true}, function(e, r){
					fs.renameSync(tmpPath, query.pathFiles + file.id);
					q.end({file: r.ops[0]});
				});
			});
		});
	};
});

S['fs.list'] = function(m, ws){
	if(!ws.session.user || !ws.session.user.super) return;

	fs.readdir(m.path, function(err, files){
		if(!err && m.cb)
			RE[m.cb]({list: files});
	});
};

S['createStream'] = function(m, ws){
	var tmpName = randomString(20),
		tmpPath = query.tmp + tmpName,
		tmpStream = fs.createWriteStream(tmpPath, {flags: 'w'});

	ws.stream = tmpStream;

	if(m.cb)
		RE[m.cb]({name: tmpName});
}

S['saveStream'] = function(m, ws){
	if(!ws.stream) return ws.json({error: 'no stream'});

	ws.stream.end();
	var tmpName = ws.stream.path.split('/').pop();

	var user = ws.session.user;

	if(m.location){
		var save = FS.locations[m.location];

		if(typeof save == 'function')
			save(m, ws);
		return;
	}

	if(m.id){
		C[cfg.fs.collection].find({id: m.id}).toArray(function(err, data){
			if(!data || !data[0]) return ws.json({error: 'file not found'});

			var file = data[0];
			if(file.owner && (!user || user.id != file.owner))
				return ws.json({error: 'access denied'});

			var set = {
				updated: (new Date()).getTime(),
				size: ws.stream.bytesWritten
			};

			_.extend(file, set);

			fs.renameSync(ws.stream.path, file.path || (query.pathFiles + file.id));
			C[cfg.fs.collection].update({id: file.id}, {$set : set}, function(){
				if(m.cb) RE[m.cb]({file: file, name: tmpName});
			});
		});
		return;
	}

	var file = {
		id: randomString(9),
		size: ws.stream.bytesWritten,
		time: (new Date()).getTime()
	};

	if(typeof m.name == 'string')
		file.name = m.name;

	if(typeof m.mime == 'string')
		file.mime = m.mime;

	if(user) file.owner = user.id;

	C[cfg.fs.collection].insert(file, {safe: true}, function(e, r){
		fs.renameSync(ws.stream.path, query.pathFiles + file.id);
		delete ws.stream;

		if(m.cb) RE[m.cb]({file: r.ops[0], name: tmpName});
	});
}

S.download = function(m, ws){
	FS.collection.find({id: m.id}).toArray(function(err, data){
		if(!data || !data[0]) return RE[m.cb]({error: 'file not found'});

		var file = data[0];
		var path = file.path || (query.pathFiles + file.id);

		var readStream = fs.createReadStream(path);

		readStream.on('data', function(data){
			ws.send(data);
		});

		readStream.on('close', function(err){
			if(m.cb) RE[m.cb]({cmd: 'closeStream', error: err, file: file});
		});

		readStream.on('error', function(err){
			if(m.cb) RE[m.cb]({error: 'file not exists', file: file});
		});
	});
};

S['fs.clone'] = function(m, ws){
	var cb = (say)=>{
		if(!m.cb) return;
		if(typeof say == 'string') RE[m.cb]({error: say});
		else RE[m.cb](say);
	};

	var user = ws.session.user;

	C.tree.findOne({id: m.id}, function(e, item){
		if(e && !item) return cb('wrong id');

		var file = _.pick(m.item, 'name', 'mime', 'size');
		_.extend(file, {
			id: randomString(9),
			time: (new Date()).getTime(),
			created: (new Date()).getTime()
		});
		if(user) file.owner = user.id;


		C[cfg.fs.collection].insert(file, {safe: true}, function(e, r){
			if(e || !r || !r.ops[0]) return cb('error inserting file');
			fs.copySync(item.path || (query.pathFiles + item.id), query.pathFiles + file.id);
			cb({file: r.ops[0]});
		});
	});
}

S['fs.download'] = function(m, ws){
	if(typeof m.url !== 'string') return RE[m.cb]({error: 'no url'});

	var tmpName = randomString(20),
		tmpPath = query.pathFiles+tmpName,
		tmpStream = fs.createWriteStream(tmpPath, {flags: 'w'});

	var mod = require(m.url.indexOf('https:')==0?'https':'http');
	var request = mod.get(m.url, function(response){
		response.pipe(tmpStream);
		tmpStream.on('finish', function() {
			tmpStream.close(function(){
				var file = {
					id: randomString(9)
				};

				var user = ws.session.user;
				if(user) file.owner = user.id;
				file.created = (new Date()).getTime();

				db.collection(cfg.fs.collection).insert(file, {safe: true}, function(e, r){
					if(!r.ops[0]) return;
					fs.renameSync(tmpPath, query.pathFiles + file.id);
					RE[m.cb]({file: r.ops[0]});
				});
			});
		});
	});
};


S.get = function(m, ws){
	if(!m.filter) return;
	var filter = _.extend(m.filter, {});


	var collection = coll.list[m.collection || coll.main];
	if(!collection) return;

	collection.find(filter).toArray(function(err, data){
		if(err || !data || !data[0]) console.log(err);
		if(m.cb)
			RE[m.cb]({item: data[0]});
	});
};

POST.fs = function(q){
	switch(q.p[1]){
		case 'list':
			var path = './static/'+(q.domain+'/').replace(/\/\.+/g,'') + (q.post.path || '');
			fs.readdir(path, function(err, files){
				q.end({list: files});
			});
			break;

		case 'add':
			if(typeof q.post.url !== 'string') return q.end({error: 'no url'});

			var file = {
				id: randomString(9)
			};
			if(q.user) file.owner = q.user.id;
			file.created = (new Date()).getTime();
			file.url = q.post.url;

			db.collection(cfg.fs.collection).insert(file, {safe: true}, function(e, doc){
				q.end({file: doc[0]});
			});
			break;

		case 'download':
			if(typeof q.post.url !== 'string') return q.end({error: 'no url'});

			var tmpName = randomString(20),
				tmpPath = query.pathFiles+tmpName,
				tmpStream = fs.createWriteStream(tmpPath, {flags: 'w'});

			var request = require('http').get(q.post.url, function(response){
				response.pipe(tmpStream);
				tmpStream.on('finish', function() {
					tmpStream.close(function(){
						var file = {
							id: randomString(9)
						};
						if(q.user) file.owner = q.user.id;
						file.created = (new Date()).getTime();

						db.collection(cfg.fs.collection).insert(file, {safe: true}, function(e, doc){
							fs.renameSync(tmpPath, query.pathFiles + file.id);
							q.end({file: doc[0]});
						});
					});
				});
			});
			break;
	};
};

SOCK.sys = function(ws){
	ws.on('message', function(msg){
		if(typeof msg == 'string'){
			var m = JSON.parse(msg);

			if(m._ == 'track')
				sys.sockets2track[m.id] = ws;
		}
	});
};
