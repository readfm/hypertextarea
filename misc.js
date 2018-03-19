var fs   = require('fs');


const YAML = require('js-yaml');

//const require_yaml = path => YAML.safeLoad(fs.readFileSync(path, 'utf8'));
global.require_yaml = function(path){
  try {
    var doc = YAML.safeLoad(fs.readFileSync(path, 'utf8'));
    return doc;
  } catch (e) {
    console.error(e);
  }
}

global.Misc = {
  
};
