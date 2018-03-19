const path = require('path'),
      fs = require('fs'),
      yaml = require('js-yaml'),
      url = require('url'),
      {app, BrowserWindow} = require('electron');


global.Electron = exports = {
  active: {},
  createWindow: function(name){
    console.log('Creating window: ', name);

    var makePath = file => path.join(App.path, 'static', name, file);

    var cfg_path = makePath('app.yaml'),
        cfg_text = fs.existsSync(cfg_path)? fs.readFileSync(cfg_path, 'utf8'):null,
        cfg = _.extend(Cfg.electron.window, yaml.safeLoad(cfg_text));

    console.log(cfg);

    let win = this.active[name] = new BrowserWindow(cfg.window);

    win.loadURL(makePath('index.html'));

    if(cfg.openDevTools)
      win.webContents.openDevTools();

    win.setMenu(null);

    win.on('closed', () => {
      win = this.active[name] = null;
    });
  },

  init: function(){
    var that = this;
    // Quit when all windows are closed.

    app.on('ready', () => {
      that.createWindow(process.argv[2] || Cfg.default_app || 'home');
    });

    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    })

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (win === null) {
        that.createWindow(Cfg.default_app)
      }
    });
  }
};
