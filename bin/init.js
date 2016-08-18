'use strict';

const path = require('path');
const lib = require('./lib');
const mkdirsSync = lib.mkdirsSync;
const symlinkSync = lib.symlinkSync;
const fsExistsSync = lib.fsExistsSync;

function init(conf) {
  if(conf.serverRootPathShouldExist && !fsExistsSync(conf.serverRootPath)) {
    console.warn('The server directory should already exit :');
    console.warn('   ', conf.serverRootPath);
    process.exit();
  }
  mkdirsSync(conf.clientRootPath);
  mkdirsSync(conf.clientSrcPath);

  mkdirsSync(conf.serverRootPath);
  mkdirsSync(conf.serverSrcPath);
 
  mkdirsSync(conf.modulesRootPath);
  mkdirsSync(conf.nodeModulesPath);
  symlinkSync(conf.nodeModulesPath, path.join(conf.modulesRootPath, 'node_modules'));
}
module.exports = init;
