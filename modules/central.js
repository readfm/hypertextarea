window.Central = {
  connect: q => {
		var ws = Central.ws = new WS({
			server: /*window.isElectron?'localhost:81':*/Cfg.central.server,
			sid: Cookies.get(Cfg.sidCookie),
			name: 'main'
		});

		var S = ws.on;
		Central.W = (msg, cb) => {ws.send(msg, cb)};

		S.session = function(m){
			Cookies.set(Cfg.sidCookie, m.sid);
			//if(m.user) acc.ok(m.user);
			Central.session = m;
		}

		S.error = function(m){
			if(m.ofCmd && S.error[m.ofCmd])
				S.error[m.ofCmd](m);
		}
	},

  fetchView: function(path){
    return new Promise((resolve, reject) => {
      Central.W({
        cmd: 'load',
        filter: {path, type: 'view', owner: 'dukecr'},
        sort: {updated: -1},
        collection: 'pix8'
      }, function(r){
        if(!r.items || !r.items.length) return resolve();

        var view = r.items[0];
        view.tag = path;
        var ids = [];

        view = Data.saveSync(view);


        if(view.items)
          Central.W({
            cmd: 'load',
            filter: {
              id: {$in: view.items},
              type: 'image'
            },
            collection: 'pix8'
          }, function(r){
            var ids = [];
            (r.items || []).forEach(item => {
              Data.saveSync(item);
            });

            Pix8.linkView(view);
            console.log('Saved: ', view.tag);

            resolve();
          });
      });
    });
  },

  collectWord: function(){
    if(!Central.words || !Central.words.length) return;

    var view = Central.words.pop();
    if(view.path && !Pix8.words[view.path]){
      Central.fetchView(view.path).then(Central.collectWord);
    }
    else{
      console.log('Already: ', view.path);
      Central.collectWord();
    }
  },

  loadWords: function(){
    Central.W({
      cmd: 'load',
      filter: {
        path: {$regex: "^(?!http).+"},
        type: "view"
      },
      sort: {
        updated: -1, time: -1
      },
      mod: {
        id: -1,
        path: -1
      },
      collection: 'pix8'
    }, r => {
      Central.words = r.items;

      Central.collectWord();
    });
  }
}
