'use strict';

const os = require('os');
const fs = require('fs-extra');
const path = require('path');

const conf = require('./conf');
const modules = require('./modules');

const CLIENT = 'client';
const SERVER = 'server';
const MODULES = 'modules';

function updateFile(rootPath, symlinkListName) {
  const gitignorePath = path.join(rootPath, '.gitignore');
  const symlinkList = conf[symlinkListName];
  const symlinkListAdd = conf[symlinkListName + 'Add'];
  const symlinkListRemove = conf[symlinkListName + 'Remove'];

  fs.ensureFileSync(gitignorePath);

  const gitignoreList = fs.readFileSync(gitignorePath, 'utf-8').split(/\r\n|\r|\n/);
  if(gitignoreList[gitignoreList.length-1].length === 0) {
    gitignoreList.pop();
  }

  gitignoreList.removeList(symlinkList).removeList(symlinkListRemove).removeList(symlinkListAdd);

  fs.writeFileSync(gitignorePath, gitignoreList.concat(symlinkList.addList(symlinkListAdd).removeList(symlinkListRemove).sort()).join(os.EOL), 'utf-8');
}

function update() {
  if(conf.gitignore) {
    updateFile(conf.clientRootPath, 'clientSymlinkList');
    updateFile(conf.serverRootPath, 'serverSymlinkList');
    updateFile(conf.modulesRootPath, 'modulesSymlinkList');
  }
}
module.exports.update = update;
