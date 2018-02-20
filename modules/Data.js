global.Data = {
  items: [],
  dir: Path.join(require('os').homedir(), 'Desktop', 'myItems'),
  init: function(cfg){
    //this.init_ipfs();
    if(!FS.existsSync(this.dir))
      FS.mkdirSync(this.dir);
  },

  init_ipfs: function(){

  },

  generate_id: () => randomString(5),

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
  }
};

Data.init();
