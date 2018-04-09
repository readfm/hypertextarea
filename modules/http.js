const Path = require('path');

var mod = module.exports = global.Http = {
  init: function(){
    mod.server = require('http').createServer(query.serv);

    mod.server.listen(Cfg.port, function(err){
    	if(err) return cb(err);

    	var uid = parseInt(process.env.SUDO_UID);
    	if (uid) process.setuid(uid);

    	console.log('HTTP Server is running on :' + Cfg.port);
    });
  },

  GET_: {},
  GET: {},
  POST: {},
  PUT: {}
};



Http.GET['apps'] = function(q){
  const path = q.p[2]?q.p.slice(2).join('/'):'browse.html',
        file = Path.join(Neuro.path, 'apps', q.p[1], path);

  console.log(path);
  console.log(file);

  query.pump(q, file);
};
