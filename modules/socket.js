const url = require('url');

var Module = {
  init: function(){
    const express = require('express');
    const http = Neuro.express = express();

    var server = require('http').Server(http);
    server.listen(Cfg.port);

    http.use(require('cors')());

    var io = global.IO = require('socket.io')(server);

    io.on('connection', function (socket) {
      socket.on('blockstack-authResponse', (d, re) => {
        re('got');

        var app = Neuro.apps[d.app];
        var win = app.windows.index;
        var url = require('path').join(app.dir, 'main.html');
        url += '?' + require('querystring').stringify(_.pick(d, 'authResponse'));
        win.loadURL(url);

        return;

        var app = Neuro.apps.notospy,
            win = app.conf.windows.main;

        win.url = {
          params: {
            authResponse: d
          }
        };

        Neuro.openWindow(app, 'main');
        app.windows.index.close();
      });


      socket.on('blockstack-profile', (d, re) => {
        console.log(d);
        win.webContents.send('blockstack-profile', d);
        re('got');
      });

      socket.on('blockstack-profile', (d, re) => {
        console.log(d);
        win.webContents.send('blockstack-profile', d);
        re('got');
      });
    });
  }
};

module.exports = Module;
