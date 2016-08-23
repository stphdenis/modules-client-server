'use strict';

const path = require('path');
const fs = require('fs');
const conf = require('./conf');
const lib = require('./lib');

function init() {
  if(conf.serverRootPathShouldExist && !fsExistsSync(conf.serverRootPath)) {
    console.warn('The server directory should already exit :');
    console.warn('   ', conf.serverRootPath);
    process.exit();
  }
  lib.mkdirs(conf.clientRootPath);
  lib.mkdirs(conf.clientSrcPath);

  lib.mkdirs(conf.serverRootPath);
  lib.mkdirs(conf.serverSrcPath);
 
  lib.mkdirs(conf.modulesRootPath);
  lib.mkdirs(conf.nodeModulesPath);
  lib.symlink(conf.nodeModulesPath, path.join(conf.modulesRootPath, 'node_modules'));

  if(conf.confFileInitialized == false) {
    console.warn('--- Initialize', conf.confFilePath);
    fs.writeFileSync(conf.confFilePath, '{}', 'utf-8');
    conf.confFileInitialized == true;
  }
}
module.exports = init;
