global.Data = {
  items: [],
  dir: Path.join(require('os').homedir(), 'Desktop', 'myItems'),
  init: function(cfg){
    //this.init_ipfs();
    if(!FS.existsSync(this.dir))
      FS.mkdirSync(this.dir);

    this.serve(Cfg.Data.port);
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

  saveFile: function(buf){
    console.log(buf);
    return new Promise((resolve, reject) => {
      var id = Data.generate_id(),
          path = Path.join(this.dir, id);

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

  append: function(id, line){
    var path = Path.join(this.dir, id+'.log');
    FS.appendFileSync(path, "\n"+line);
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
      var content = FS.readFileSync(path+'.log');
      var item = content.split("\n");
    }
    else return;

    return item
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

Data.init();
