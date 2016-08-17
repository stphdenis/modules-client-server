'use strict';

const fs = require('fs');
const path = require('path');
const conf = require('./conf');
const lib = require('./lib');
const isDirSync = lib.isDirSync;
const mkdirsSync = lib.mkdirsSync;
const isSymlinkSync = lib.isSymlinkSync;
const symlinkSync = lib.symlinkSync;
const unlinkSync = lib.unlinkSync;

function synchronize(moduleName) {
  const moduleCommonPath = getModuleCommonPath(moduleName);
  const moduleClientPath = getModuleClientPath(moduleName);
  const moduleServerPath = getModuleServerPath(moduleName);
  if(!conf.moduleClientCommonName) {
    for(let commonDir of fs.readdirSync(moduleCommonPath)) {
      symlinkSync(path.join(moduleCommonPath, commonDir), path.join(moduleClientPath, commonDir));
    }
    for(let commonDir of fs.readdirSync(moduleClientPath)) {
      if(isSymlinkSync(path.join(moduleClientPath, commonDir)) && !isDirSync(path.join(moduleCommonPath, commonDir))) {
        unlinkSync(path.join(moduleClientPath, commonDir));
      }
    }
  }
  if(!conf.moduleServerCommonName) {
    for(let commonDir of fs.readdirSync(moduleCommonPath)) {
      symlinkSync(path.join(moduleCommonPath, commonDir), path.join(moduleServerPath, commonDir));
    }
    for(let commonDir of fs.readdirSync(moduleServerPath)) {
      if(isSymlinkSync(path.join(moduleServerPath, commonDir)) && !isDirSync(path.join(moduleCommonPath, commonDir))) {
        unlinkSync(path.join(moduleServerPath, commonDir));
      }
    }
  }
}

function watchStart(moduleName) {
  if(conf.watcherActive && !conf.watchers.moduleName) {
    conf.watchers[moduleName] = fs.watch(getModuleCommonPath(moduleName), event => {
      synchronize(moduleName);
    });
  }
}

function watchStop(moduleName) {
  if(conf.watcherActive && conf.watchers[moduleName]) {
    conf.watchers[moduleName].close();
  }
}

function addModule(moduleName) {
  if(!isDirSync(conf.clientSrcPath) || !isDirSync(conf.serverSrcPath) || !isDirSync(conf.modulesRootPath)) {
    console.warn('you have to initialize with --init');
    process.exit();
  }

  const moduleClientPath = getModuleClientPath(moduleName);
  const moduleCommonPath = getModuleCommonPath(moduleName);
  const moduleServerPath = getModuleServerPath(moduleName);

  mkdirsSync(moduleClientPath);
  mkdirsSync(moduleCommonPath);
  mkdirsSync(moduleServerPath);

  symlinkSync(moduleClientPath, getClientModulePath(moduleName));
  symlinkSync(moduleServerPath, getServerModulePath(moduleName));
  if(conf.moduleClientCommonName) {
    symlinkSync(moduleCommonPath, getModuleClientCommonPath(moduleName));
  }
  if(conf.moduleServerCommonName) {
    symlinkSync(moduleCommonPath, getModuleServerCommonPath(moduleName));
  }
  watchStart(moduleName);
}

function addModules(modules) {
  for(let moduleName of modules) {
    addModule(moduleName);
  }
}

function removeModule(moduleName) {
  watchStop(moduleName);
  unlinkSync(path.join(conf.clientSrcPath, moduleName));
  unlinkSync(path.join(conf.serverSrcPath, moduleName));
}

function removeModules(modules) {
  for(let moduleName of modules) {
    removeModule(moduleName);
  }
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
    return path.join(conf.serverSrcPath, conf.clientModulesName, moduleName);
  } else {
    return path.join(conf.serverSrcPath, moduleName);
  }
}

module.exports.synchronize = synchronize;
module.exports.watchStart = watchStart;
module.exports.watchStop = watchStop;
module.exports.addModule = addModule;
module.exports.addModules = addModules;
module.exports.removeModule = removeModule;
module.exports.removeModules = removeModules;
module.exports.getModuleClientPath = getModuleClientPath;
module.exports.getModuleCommonPath = getModuleCommonPath;
module.exports.getModuleServerPath = getModuleServerPath;
module.exports.getModuleClientCommonPath = getModuleClientCommonPath;
module.exports.getModuleServerCommonPath = getModuleServerCommonPath;
module.exports.getClientModulePath = getClientModulePath;
module.exports.getServerModulePath = getServerModulePath;
