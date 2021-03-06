#!/usr/bin/env node
'use strict';

//node ..\..\meteor-npm\modules-client-server\bin\modules-client-server.js

const fs = require('fs-extra');
const path = require('path');

const lib = require('./lib');

const conf = require('./conf');
const init = require('./init');
const modules = require('./modules');
const gitignore = require('./gitignore');

const packages = require('../package.json');

function help() {
  console.info(`Usage: ${packages.name} --init
       ${packages.name} --init --add module1
       ${packages.name} --add module1 module2 --remove module3
       ${packages.name} --sync

  -h, --help      this help
  -v, --version   print ${packages.name}.js version
  -i, --init      initialize the client/server architecture
  -a, --add       create new module(s) and symlink to client and server side
                  just symlink to client and server side for module(s) already there
  -r, --remove    unlink a module(s) from client and server side
  -s, --sync      synchronize the common part of the module to client and server side
  -w, --watch     watch the modules to sync when necessary`);
}

const options = {
  modulesToAdd: [],
  modulesToRemove: [],
};
let instrAdd = false;

var i = 2;
while(i < process.argv.length) {
  var arg = process.argv[i++];
       if (arg === '--help' || arg == '-h') options.paramHelp = true;
  else if (arg === '--version' || arg == '-v') options.paramVersion = true;
  else if (arg === '--init' || arg == '-i') options.paramInit = true;
  else if (arg === '--add' || arg == '-a') {
    while (i < process.argv.length) {
      arg = process.argv[i];
      if (arg[0] != '-') {
        options.modulesToAdd.push(arg);
      } else {
        if(options.modulesToAdd.length) {
          break;
        } else {
          console.warn('--add need a module name');
          help();
          process.exit();
        }
      }
      i++;
    }
  }
  else if (arg == '--remove' || arg == '-r') {
    while (i < process.argv.length) {
      arg = process.argv[i];
      if (arg[0] != '-') {
        options.modulesToRemove.push(arg);
      } else {
        if(options.modulesToRemove.length) {
          break;
        } else {
          console.warn('--remove need a module name');
          help();
          process.exit();
        }
      }
      i++;
    }
  }
  else if (arg == '--sync' || arg == '-s') options.paramSync = true;
  else if (arg == '--watch' || arg == '-w') options.paramWatch = true;
  else if (arg == '--conf' || arg == '-c') options.showConf = true;
  else {
    help();
    console.info('');
    console.info(`unknown parameter: ${arg}`);
    process.exit();
  }
}

if (options.paramHelp) {
  help();
}

if (options.paramVersion) {
  console.info(`v${packages.version}`);
}

if (options.paramInit) {
  init(conf);
  options.paramSync = true;
}

if(options.showConf) {
  conf.show();
}

if (lib.hasIntersection(options.modulesToAdd, options.modulesToRemove)) {
  console.warn(`can't add and remove the same module at same time`);
  process.exit();
}

if (options.modulesToAdd.length > 0) {
  for(let moduleName of options.modulesToAdd) {
    modules.add(moduleName);
  }
  options.paramSync = true;
}

if (options.modulesToRemove.length > 0) {
  for(let moduleName of options.modulesToRemove) {
    modules.remove(moduleName);
  }
  options.paramSync = true;
}

if(options.paramSync || options.paramWatch) {
  lib.symlink(conf.nodeModulesPath, path.join(conf.modulesRootPath, 'node_modules'));
  for(let moduleName of fs.readdirSync(conf.modulesRootPath)) {
    if(moduleName !== 'node_modules' && lib.isDir(path.join(conf.modulesRootPath, moduleName))) {
      modules.synchronize(moduleName);
    }
  }
}

console.info('clientSymlinkList :', conf.clientSymlinkList);
console.info('serverSymlinkList :', conf.serverSymlinkList);
console.info('modulesSymlinkList :', conf.modulesSymlinkList);
console.info('clientSymlinkListAdd :', conf.clientSymlinkListAdd);
console.info('serverSymlinkListAdd :', conf.serverSymlinkListAdd);
console.info('modulesSymlinkListAdd :', conf.modulesSymlinkListAdd);
console.info('clientSymlinkListRemove :', conf.clientSymlinkListRemove);
console.info('serverSymlinkListRemove :', conf.serverSymlinkListRemove);
console.info('modulesSymlinkListRemove :', conf.modulesSymlinkListRemove);
gitignore.update();
conf.update();

if(options.paramWatch) {
  conf.watcherActive = true;
  function watchStartAll() {
    for(let moduleName of fs.readdirSync(conf.modulesRootPath)) {
      if(moduleName !== 'node_modules' && lib.isDir(path.join(conf.modulesRootPath, moduleName))) {
        modules.startWatch(moduleName);
      }
    }
    if(conf.gitignore) {
      gitignore.update();
    }
  }
  fs.watch(conf.modulesRootPath, event => {
    watchStartAll();
  });
  watchStartAll();
}
