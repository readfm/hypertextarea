const FS = require('fs');
const Path = require('path');
const YAML = require('js-yaml');

global.Data = {
  cfg: Cfg.Data,
  items: {},
  dir: Path.join(require('os').homedir(), 'Desktop', Cfg.Data.folder || 'myItems'),
  init: function(cfg){
    //this.init_ipfs();
    if(!FS.existsSync(this.dir))
      FS.mkdirSync(this.dir);

    this.serve(Cfg.Data.port);

    console.log('Module data was initiated');
  },

  init_ipfs: function(){

  },

  generate_id: () => randomString(8),

  save: function(item){
    return new Promise((resolve, reject) => {
      try{
        var itm = this.saveSync(item);
      }
      catch(err){
        console.error(err);
        return reject(err);
      }

      resolve(itm);
    });
  },

  storeAsType: 'yaml',
  saveSync: function(item){
    if(typeof item == 'object'){
      var path, content;

      if(item.length){
        content = item.join("\n");
        path = Path.join(this.dir, item.id+'.log');
      }
      else{
        if(!item.id) item.id = Data.generate_id();

        if(this.storeAsType == 'yaml'){
          content = YAML.safeDump(item);
          path = Path.join(this.dir, item.id+'.yaml');
        }
        else{
          content = JSON.stringify(item);
          path = Path.join(this.dir, item.id+'.json');
        }

        FS.writeFileSync(path, content);
      }

      Data.items[item.id] = item;
      return item;
    }
  },

  update: function(id, set){
    return new Promise((resolve, reject) => {
      try{
        var itm = this.updateSync(id, set);
      }
      catch(err){
        return reject(err);
      }

      resolve(itm);
    });
  },

  updateSync: function(id, set){
    if(typeof set == 'object'){
      var item = Data.loadSync(id) || {id};
      _.extend(item, set);
      Data.saveSync(item);

      return item;
    }
  },

  saveFile: function(buf, id){
    return new Promise((resolve, reject) => {
      if(!id) id = Data.generate_id();

      var path = Path.join(this.dir, id);

      try{
        FS.writeFileSync(path, Buffer.from(buf));
      }
      catch(err){
        console.error(err);
        return reject(err);
      }

      resolve(id);
    });
  },

  upd: 4,
  log: function(line, id){
    if(!id) id = Data.generate_id();

    var path = Path.join(this.dir, id+'.log');

    if(!FS.existsSync(path))
      FS.writeFileSync(path, line);
    else
      FS.appendFileSync(path, "\r\n"+line);

    if(Data.items[id])
      Data.items[id].push(line);
    else
      Data.items[id] = [line];

    return id;
  },

  load: function(id){
    return new Promise((resolve, reject) => {
      try{
        var itm = this.loadSync(id);
      }
      catch(err){
        console.error(err);
        return reject(err);
      }

      resolve(itm);
    });
  },

  share: function(){

  },

  loadSync: function(id){
    var ids = [];
    if(typeof id == 'object'){
      if(id.length)
        ids = id;
      else return;
    }
    else if(typeof id == 'string'){
      ids = [id];
    }
    else return;

    var items = [];
    ids.forEach(ida => {
      if(typeof this.items[ida] == 'object'){
        var item = this.items[ida];
      }
      else
        var item = this.items[ida] = this.read(ida);

      items.push(item);
    });

    return (typeof id == 'string' || typeof id == 'number')?items[0]:items;
  },

  read: function(id){
    var path = Path.join(this.dir, id);

    if(FS.existsSync(path+'.json')){
      var content = FS.readFileSync(path+'.json');
      var item = JSON.parse(content);
    }
    else
    if(FS.existsSync(path+'.yaml')){
      var content = FS.readFileSync(path+'.yaml');
      var item = YAML.safeLoad(content);
    }
    else
    if(FS.existsSync(path+'.log')){
      var content = String(FS.readFileSync(path+'.log'));

      var item = content.split(/\r?\n/);
    }
    else return;

    return item
  },

  getPath: function(id){
    var path = Path.join(Data.dir, id);

    if(FS.existsSync(path+'.json'))
      return path+'.json';

    if(FS.existsSync(path+'.yaml'))
      return path+'.yaml';

    if(FS.existsSync(path+'.log'))
      return path+'.log';

    return path;
  },

  serve: function(port){
    require('http').createServer((req, res) => {
    	var Url = require('url').parse(req.url),
    	    uri = decodeURI(Url.pathname).replace(/^\/+|[^A-Za-z0-9_.:\/~ @-]|\/+$/g, '');
    	const p = uri.split(/[\/]+/);

      var path = Path.join(this.dir, p[0]);

      try{
        var stat = FS.lstatSync(path);
      } catch(e){
        console.error(e);
        res.writeHead(404);
        res.end();
        return;
      }

      var headers = {
        'Cache-Control': 'no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      };

      res.writeHead(200, headers);
      var readStream = FS.createReadStream(path);
      readStream.pipe(res);
    }).listen(port || Cfg.Data.port);
  },

	pump: function(res){

	},
};

module.exports = Data;

Http.GET['items'] = function(q){
  var cfg = {
    path: Data.getPath(q.p[1])
  };

  query.pump(q, cfg);
};

API.test = (m, q, re) => {
    re({
      re: 'it works'
    });
};

API.log = (m, q, re) => {
  var id = Data.log(m.line, m.id);
  if(m.cb) re({id});
};

API.load = (m, q, re) => {
  Data.load(m.id).then(r => {
    re({
      item: r
    });
  });
};

API.update = (m, q, re) => {
  var item = Data.updateSync(m.id, m.set);
  if(m.cb) re({item});
};

API.save = (m, q, re) => {
  Data.save(m.item).then(r => {
    re({
      item: r
    });
  });
};

/*
API.createStream = function(m, ws, re){
  var id = Data.generate_id(),
      path = Path.join(this.dir, id),
  		stream = fs.createWriteStream(path, {flags: 'w'});

	ws.stream = stream;

	re({id});
}

S['createStream'] = function(m, ws){
	var tmpName = randomString(20),
		tmpPath = query.tmp + tmpName,
		tmpStream = fs.createWriteStream(tmpPath, {flags: 'w'});

	ws.stream = tmpStream;

	if(m.cb)
		RE[m.cb]({name: tmpName});
}


API.saveStream = function(m, ws, re){
	if(!ws.stream) return ws.json({error: 'no stream'});

	ws.stream.end();
	var tmpName = ws.stream.path.split('/').pop();

	var user = ws.session.user;

	if(m.id){
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
	}

	var file = {
		id: Data.generate_id(),
		size: ws.stream.bytesWritten,
		time: (new Date()).getTime(),
    owner: Me.id
	};

	if(typeof m.name == 'string')
		file.name = m.name;

	if(typeof m.mime == 'string')
		file.mime = m.mime;

  Data.save(file);
  Data.saveFile(ws.stream);

	C[cfg.fs.collection].insert(file, {safe: true}, function(e, r){
		fs.renameSync(ws.stream.path, query.pathFiles + file.id);
		delete ws.stream;

		if(m.cb) re({file: r.ops[0], name: tmpName});
	});
}
*/
