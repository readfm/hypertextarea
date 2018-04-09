global._ = require('underscore');
const fs = require('fs');
const clc = require('clc');
const Path = require('path');

global.Electron = require('electron');

require('./misc.js');

global.Cfg = require_yaml('./config.yaml');

global.Sessions = {};

require('./neuro.js');
Neuro.init();

Cfg.modules.forEach(name => Neuro.loadModule(name));
Object.keys(Neuro.modules).forEach(name => {
  var module = Neuro.modules[name];

  if(typeof module.init == 'function'){
    console.log('Init: ', name);
    module.init();
  }
});

process.emit('modules_ready');

if(process.versions['electron']){
  (Cfg.electronSwitches || []).forEach(option => {
    if (typeof option === 'string')
      Electron.app.commandLine.appendSwitch(option);
    else
      Electron.app.commandLine.appendSwitch(option[0], option[1]);
  });

  Electron.app.on('ready', () => Neuro.run(process.argv[2] || Cfg.default_app));
};

var stdin = process.openStdin();
stdin.setEncoding('utf8');

stdin.on('data', function (input){
	console.log(eval(input));
});
