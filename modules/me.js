const Path = require('path');
const FS = require('fs');

var mod = module.exports = global.Me = {
  init: function(){
    var id_path = Path.join(Neuro.path, 'my_id.txt');

    if(FS.existsSync(id_path)){
      this.id = String(FS.readFileSync(id_path));
    }
    else{
      var id = Data.generate_id();
      FS.writeFileSync(id_path, id);
      this.id = id;
    }
  }
};
