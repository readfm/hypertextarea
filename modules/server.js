require('./core.js');

global.fs = require('fs');
global.util = require('util');
global.validator = require('validator');
global.Yaml = require('js-yaml');
global.cookie = require('cookie');
global.whiskers = require('whiskers');


global.cfg = global.Cfg = Yaml.safeLoad(fs.readFileSync('./'+(process.argv[2] || 'cfg')+'.yaml', 'utf8'));
	
global.email = require("emailjs").server.connect(cfg.email);

if(cfg.mongodb){
	global.mongo = require('mongoskin');
	global.db = mongo.db(cfg.mongodb.path);
}

if(cfg.tingodb){
	var Tingo = require('tingodb')();
	global.DBT = new Tingo.Db(cfg.tingodb.path, {});
	if(!global.db) global.db = DBT;
}

cfg.modules.forEach(function(name){
	var file = './modules/' + name + '.js';
	
	var module = mod[name] = require(file);
	console.log(clc.blue.bold(name));

	if(cfg.devMode)
		fs.watchFile(file, function(curr, prev){
			console.log(clc.yellow(curr.mtime.toString()) +' '+ clc.blue(name));
			delete require.cache[require.resolve(file)];
			require(file);
			if(module._reload) module._reload();
		});
});

(cfg.apps || []).forEach(function(name){
	var file = './apps/' + name;
	require(file);
});

sys.emit('loaded');

fs.readdirSync('./static').forEach(function(el){
	query.staticDomains[el] = {};
});


global.http = require('http').createServer(query.serv);

http.listen(cfg.port, function(err){
	if(err) return cb(err);

	var uid = parseInt(process.env.SUDO_UID);
	if (uid) process.setuid(uid);
	
	console.log(clc.green.bold('Server is running on :') + cfg.port);
});


var https = require('https').createServer(Security.https_options, query.serv);
https.listen(443);


socket.run(http);
socket.run(https);

if(cfg.social)
	require('./apps/authom.js');