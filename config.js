window.Cfg = {
	//server: '10.0.0.29:81/',
	server: 'io.cx/',

	Data: {
		host: 'http://127.0.0.1',
		port: 8083
	},

	//server: 'taitis.com',
	//server: 'localhost',
	//server: document.location.host,
	local_server: '127.0.0.1:81',
	defaultYoutube: 'ME4NUY5a-4M&t=52.4;8',
	files: 'http://127.0.0.1:8083/',
	//files: 'http://files.lh/',
	//thumber: 'http://thumb.lh/',
	thumber: 'http://thumb.pix8.co/',
	collection: 'pix8',

	home: 'http://io.cx/',
	preload: 'http://pix8.co/',

	apis: {},

	sidCookie: 'pix8sid',

	drag: {
		takeOffLimit: 12,
		dy: 15,
		dx: 10
	},

	collector: {
		minWidth: 60,
		minHeight: 60,
		limit: 20
	},

	limits: {
		minPix8Height: 40,
		minFrameHeight: 100,
		minControlHeight: 80
	},

	auth: {
		site: 'http://auth.io.cx',
		avatar: 'http://auth.io.cx/user',
		google: 'http://taitis.com/auth/google'
	},

	ggif: {
		audioFormat: 'mp3',
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 2,
		shadowColor: "#000",
		font: 'Courier New',
		color: '#FFF',
		size: 12,
		gradient1: '#000',
		gradient2: 'rgba(0,0,0,0.3)'
	},

	notification: 'http://io.cx/pix8/quack.mp3',

	game: {
		startLimit: 1
	}
};

var User = window.User = {
	id: '103915987270794097143',
	name: 'dukecr'
}
