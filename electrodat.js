const Path = require('path');

global.Electrodat = class {
  open(cfg_window){
    let win = this.window = new Electron.BrowserWindow(cfg_window);

    var path = Path.join(this.path, cfg_window.file || 'index.html');
    console.log('Electrodat open: ', path);
    win.loadURL(path);

    if(cfg_window.openDevTools)
      win.webContents.openDevTools();

    win.setMenu(null);
  }

  run(cfg){
    if(cfg.window)
      this.open(cfg.window);
  }

  constructor(path, key){
    if(!key) key = path.split('/').pop();

    this.path = path;
    this.key = key;
    var that = this;

    console.log('Electodat: ', path);
    Dat(path, {key: key}, (err, dat) => {
      dat.joinNetwork(() => {
        dat.archive.readFile('/package.yaml', function(err, content){
          var cfg = that.cfg = YAML.safeLoad(content);
          that.run(cfg);
        });
      })
    })
  }
};
