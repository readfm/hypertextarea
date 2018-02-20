const Path = require('path'),
      fs = require('fs');

global.Electron = require('electron');


const YAML = require('js-yaml');
const require_yaml = path => YAML.safeLoad(fs.readFileSync(path, 'utf8'));

var conf = require_yaml('package.yaml');


global.Main = {
  open(cfg_window){
    let win = this.window = new Electron.BrowserWindow(cfg_window);

    var path = Path.join(this.path, cfg_window.file || 'index.html');
    win.loadURL(path);

    if(cfg_window.openDevTools)
      win.webContents.openDevTools();

    win.setMenu(null);
  },

  path: __dirname,
  path_dat: Path.join(require('os').homedir(), 'Desktop', 'dat'),
}

if(process.versions['electron']){
  Electron.app.on('ready', function(){
    Main.open(conf.window);
  });
}
