require('./core.js');

global.fs = require('fs');
global.util = require('util');
global.validator = require('validator');
global.YAML = require('yamljs');
global.cookie = require('cookie');
global.whiskers = require('whiskers');

var cfgFile = process.versions['electron']?'app':null || process.argv[2] || 'cfg';
global.cfg = global.Cfg = YAML.load('./'+cfgFile+'.yaml');

if(process.versions['electron'] &&  Cfg.mongodb &&  Cfg.mongodb.port){
	var mongo_server = require("child_process").spawn(__dirname+"/bin/mongod.exe", [
	  '--dbpath', __dirname+'/data',
	  '--bind_ip', '127.0.0.1',
	  '--port', Cfg.mongodb.port
	], {cwd: process.cwd()});
	//mongo_server.stdout.on('data', console.log);
	//mongo_server.stderr.on('data', console.log);
	Cfg.mongodb.path = 'mongodb://127.0.0.1:'+Cfg.mongodb.port+'/'+Cfg.mongodb.name;
}

if(Cfg.email)
	global.email = require("emailjs").server.connect(Cfg.email);

if(Cfg.mongodb){
	global.mongo = require('mongoskin');
	global.db = mongo.db(Cfg.mongodb.path);
}

if(Cfg.tingodb){
	var Tingo = require('tingodb')();
	global.DBT = new Tingo.Db(Cfg.tingodb.path, {});
	if(!global.db) global.db = DBT;
}

cfg.modules.forEach(function(name){
	var file = './modules/' + name + '.js';

	var module = mod[name] = require(file);
	console.log(name);

	if(cfg.devMode)
		fs.watchFile(file, function(curr, prev){
			console.log(clc.yellow(curr.mtime.toString()) +' '+ clc.blue(name));
			delete require.cache[require.resolve(file)];
			require(file);
			if(module._reload) module._reload();
		});
});
process.emit('loadedModules');

(Cfg.apps || []).forEach(function(name){
	var file = './apps/' + name;
	require(file);
});

sys.emit('loaded');

if(global.query)
	fs.readdirSync('./static').forEach(function(el){
		query.staticDomains[el] = {};
	});

if(Cfg.http){
	global.http = require('http').createServer(query.serv);

	http.listen(Cfg.http.port, function(err){
		if(err) return cb(err);

		var uid = parseInt(process.env.SUDO_UID);
		if (uid) process.setuid(uid);

		console.log(clc.green.bold('Server is running on :') + Cfg.http.port);
	});

	socket.run(http);
}

if(Cfg.https){
	var https = require('https').createServer(Security.https_options, query.serv);
	https.listen(Cfg.https.port);
	socket.run(https);
}

if(cfg.social)
	require('./apps/authom.js');
