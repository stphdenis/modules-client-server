'use strict';

const fs = require('fs');
const path = require('path');
const conf = require('./conf');
const lib = require('./lib');

function synchronize(moduleName) {
  const moduleCommonPath = getModuleCommonPath(moduleName);
  const moduleClientPath = getModuleClientPath(moduleName);
  const moduleServerPath = getModuleServerPath(moduleName);
  if(conf.moduleClientCommonName) {
    lib.symlink(moduleCommonPath, getModuleClientCommonPath(moduleName));
  } else {
    for(let commonDir of fs.readdirSync(moduleCommonPath)) {
      lib.symlink(path.join(moduleCommonPath, commonDir), path.join(moduleClientPath, commonDir));
    }
    for(let symlinkDir of fs.readdirSync(moduleClientPath)) {
      if(lib.isSymlink(path.join(moduleClientPath, symlinkDir)) && !lib.pathExists(path.join(moduleCommonPath, symlinkDir))) {
        lib.unlink(path.join(moduleClientPath, symlinkDir));
      }
    }
  }
  if(conf.moduleServerCommonName) {
    lib.symlink(moduleCommonPath, getModuleServerCommonPath(moduleName));
  } else {
    for(let commonDir of fs.readdirSync(moduleCommonPath)) {
      lib.symlink(path.join(moduleCommonPath, commonDir), path.join(moduleServerPath, commonDir));
    }
    for(let symlinkDir of fs.readdirSync(moduleServerPath)) {
      if(lib.isSymlink(path.join(moduleServerPath, symlinkDir)) && !lib.pathExists(path.join(moduleCommonPath, symlinkDir))) {
        lib.unlink(path.join(moduleServerPath, symlinkDir));
      }
    }
  }
}

function startWatch(moduleName) {
  if(conf.watcherActive && !conf.watchers.moduleName) {
    conf.watchers[moduleName] = fs.watch(getModuleCommonPath(moduleName), event => {
      synchronize(moduleName);
      gitignore.update();
      conf.update();
    });
  }
}

function stopWatch(moduleName) {
  if(conf.watcherActive && conf.watchers[moduleName]) {
    conf.watchers[moduleName].close();
  }
}

function add(moduleName) {
  if(!lib.isDir(conf.clientSrcPath) || !lib.isDir(conf.serverSrcPath) || !lib.isDir(conf.modulesRootPath)) {
    console.warn('you have to initialize with --init');
    process.exit();
  }

  const moduleClientPath = getModuleClientPath(moduleName);
  const moduleCommonPath = getModuleCommonPath(moduleName);
  const moduleServerPath = getModuleServerPath(moduleName);

  lib.mkdirs(moduleClientPath);
  lib.mkdirs(moduleCommonPath);
  lib.mkdirs(moduleServerPath);

  lib.symlink(moduleClientPath, getClientModulePath(moduleName));
  lib.symlink(moduleServerPath, getServerModulePath(moduleName));
  if(conf.moduleClientCommonName) {
    lib.symlink(moduleCommonPath, getModuleClientCommonPath(moduleName));
  }
  if(conf.moduleServerCommonName) {
    lib.symlink(moduleCommonPath, getModuleServerCommonPath(moduleName));
  }
  startWatch(moduleName);
}

function remove(moduleName) {
  stopWatch(moduleName);
  lib.unlink(getClientModulePath(moduleName));
  lib.unlink(getServerModulePath(moduleName));
}

function getModuleClientPath(moduleName) {
  return path.join(conf.modulesRootPath, moduleName, 'client');
}

function getModuleClientCommonPath(moduleName) {
  if(moduleClientCommonName) {
    return path.join(conf.modulesRootPath, moduleName, 'client', moduleClientCommonName);
  } else {
    return path.join(conf.modulesRootPath, moduleName, 'client');
  }
}

function getModuleCommonPath(moduleName) {
  return path.join(conf.modulesRootPath, moduleName, 'common');
}

function getModuleServerPath(moduleName) {
  return path.join(conf.modulesRootPath, moduleName, 'server');
}

function getModuleServerCommonPath(moduleName) {
  if(moduleServerCommonName) {
    return path.join(conf.modulesRootPath, moduleName, 'server', moduleServerCommonName);
  } else {
    return path.join(conf.modulesRootPath, moduleName, 'server');
  }
}

function getClientModulePath(moduleName) {
  if(conf.clientModulesName) {
    return path.join(conf.clientSrcPath, conf.clientModulesName, moduleName);
  } else {
    return path.join(conf.clientSrcPath, moduleName);
  }
}

function getServerModulePath(moduleName) {
  if(conf.serverModulesName) {
    return path.join(conf.serverSrcPath, conf.serverModulesName, moduleName);
  } else {
    return path.join(conf.serverSrcPath, moduleName);
  }
}

module.exports.synchronize = synchronize;
module.exports.startWatch = startWatch;
module.exports.stopWatch = stopWatch;
module.exports.add = add;
module.exports.remove = remove;
//module.exports.gitignore = gitignore;
module.exports.getModuleClientPath = getModuleClientPath;
module.exports.getModuleCommonPath = getModuleCommonPath;
module.exports.getModuleServerPath = getModuleServerPath;
module.exports.getModuleClientCommonPath = getModuleClientCommonPath;
module.exports.getModuleServerCommonPath = getModuleServerCommonPath;
module.exports.getClientModulePath = getClientModulePath;
module.exports.getServerModulePath = getServerModulePath;
