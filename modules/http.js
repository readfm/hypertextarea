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
