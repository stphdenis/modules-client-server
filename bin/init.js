'use strict';

const path = require('path');
const lib = require('./lib');
const mkdirsSync = lib.mkdirsSync;
const symlinkSync = lib.symlinkSync;
const fsExistsSync = lib.fsExistsSync;

function init(conf) {
  mkdirsSync(conf.modulesRootPath);
  mkdirsSync(conf.clientSrcPath);
  mkdirsSync(conf.nodeModulesPath);
  symlinkSync(conf.nodeModulesPath, path.join(conf.modulesRootPath, 'node_modules'));
  if(conf.serverRootPathShouldExist && !fsExistsSync(conf.serverRootPath)) {
    console.warn('The server directory should already exit :');
    console.warn('   ', conf.serverRootPath);
    process.exit();
  }
  mkdirsSync(conf.serverSrcPath);
}
module.exports = init;
