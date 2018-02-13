global._ = require('underscore');

const path = require('path'),
      fs = require('fs');
global.YAML = require('js-yaml');
global.Dat = require('dat-node');

global.Package = require('./package.json');
global.NPM = require('npm');
global.Electron = require('electron');

if(process.versions['electron']){
  Electron.app.on('ready', function(){
    var app_index = path.join(__dirname, 'index.js'), app;
    console.log(app_index);
    if(fs.existsSync(app_index))
      app = require(app_index);

    Dat(__dirname, {key: Package.dat_key}, (err, dat) => {
      dat.joinNetwork(() => {
        if(!app) dat.archive.readFile(app_index, (err, content) => {
          require(app_index);
        });
      });
    });
  });

  Electron.app.on('window-all-closed', () => {
    Electron.app.quit();
  });
}
