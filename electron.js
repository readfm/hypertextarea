var Remote = window.Remote = require('electron').remote;
window.Neuro = Remote.getGlobal('Neuro');
window.App = Neuro.apps[Cfg.name];
window.Data = Remote.getGlobal('Data');
