'use strict';

const fs = require('fs-extra');
const path = require('path');
const conf = require('./conf');
const lib = require('./lib');
const isDirSync = lib.isDirSync;
const mkdirsSync = lib.mkdirsSync;
const symlinkSync = lib.symlinkSync;
const modules = require('./modules');

function synchronize() {
  console.info('conf.modulesRootPath:',conf.modulesRootPath)
  for(let moduleName of fs.readdirSync(conf.modulesRootPath)) {
    if(moduleName !== 'node_modules' && isDirSync(path.join(conf.modulesRootPath, moduleName))) {
      modules.synchronize(moduleName);
    }
  }
}
module.exports = synchronize;
