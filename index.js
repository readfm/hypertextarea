console.log('It runs');
require('./electrodat.js');

const Path = require('path'),
      fs = require('fs');

var App = {
  dat_path: Path.join(require('os').homedir(), 'Desktop', 'dat'),
  exec: function(key){
    var app_path = Path.join(this.dat_path, key);
    var ed = new Electrodat(app_path, key);
  },

  init: function(){
    if(!fs.existsSync(App.dat_path))
      fs.mkdirSync(App.dat_path);

    this.exec('4a45c57b8fa712a593e9969f1512a94dc73ceadabef5e07c8542b4c7800318e7');
    //var ed = new Electrodat(__dirname, Package.dat_key);

  }
};

App.init();
