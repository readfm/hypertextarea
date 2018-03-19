var ipfsAPI = require('ipfs-api');

var IPFS = global.IPFS = {
  api: ipfsAPI('/ip4/127.0.0.1/tcp/5001'),
  init: function(){
    /*
    const ipfs = require('ipfs');
    const node = IPFS.node = new ipfs();

    node.on('ready', () => {
      // Your node is now ready to use \o/

      // stopping a node
      node.stop(() => {
        // node is now 'offline'
      })
    })
    */
  }
};

module.exports = IPFS;
