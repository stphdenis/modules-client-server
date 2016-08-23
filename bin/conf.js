'use strict';

const fs = require('fs');
const path = require('path');

/* V1
┌ root
├─┬ clientRoot
| └─┬ clientSrc
|   └─┬ ${clientModulesName}
|     └── moduleXXX <=symlink=> modulesRoot/moduleXXX/client
├─┬ modulesRoot
| └─┬ moduleXXX
|   ├─┬ client
|   | └── ${moduleClientCommonName} <=symlink=> modulesRoot/moduleXXX/common
|   ├── common
|   └─┬ server
|     └── ${moduleServerCommonName} <=symlink=> modulesRoot/moduleXXX/common
└─┬ serverRoot
  └─┬ serverSrc
    └─┬ ${serverModulesName}
      └── moduleXXX <=symlink=> modulesRoot/moduleXXX/server
*/

/* Default :
┌ root
├─┬ clientRoot
| └─┬ clientSrc
|   └── moduleXXX <=symlink=> modulesRoot/moduleXXX/client
├─┬ modulesRoot
| └─┬ moduleXXX
|   ├─┬ client
|   | ├── commonDirXXX <=symlink=> modulesRoot/moduleXXX/common
|   | └── commonFileXXX <=symlink=> modulesRoot/moduleXXX/common
|   ├─┬ common
|   | ├── commonDirXXX
|   | └── commonFileXXX
|   └─┬ server
|     ├── commonDirXXX <=symlink=> modulesRoot/moduleXXX/common
|     └── commonFileXXX <=symlink=> modulesRoot/moduleXXX/common
└─┬ serverRoot
  └─┬ serverSrc
    └── moduleXXX <=symlink=> modulesRoot/moduleXXX/server
*/// For commonFileXXX on Windows, must execute as admin !

const pwd = path.resolve();
const rootPath = pwd;

const clientRootPath = path.join(rootPath, 'client');
const modulesRootPath = path.join(rootPath, 'modules');
const serverRootPath = path.join(rootPath, 'server');

const clientSrcPath = path.join(clientRootPath, 'src');
const nodeModulesPath = path.join(clientRootPath, 'node_modules');
const serverSrcPath = path.join(serverRootPath, 'src');

const confFilePath = path.join(pwd, 'modules-client-server.conf.json');

let confFileInitialized = false;
function getConfFile() {
  let confFileData;
  try {
    confFileData = fs.readFileSync(confFilePath);
    confFileInitialized = true;
  } catch (e) {
    return {};
  }
  return JSON.parse(confFileData);
}
let confFileData = getConfFile();

let conf = {
  pwd: pwd,
  rootPath: rootPath,

  clientRootPath: clientRootPath,
  clientSrcPath: clientSrcPath,
  nodeModulesPath: nodeModulesPath,

  serverRootPath: serverRootPath,
  serverSrcPath: serverSrcPath,

  modulesRootPath: modulesRootPath,

  clientModulesName: undefined,
  serverModulesName: undefined,

  moduleClientCommonName: undefined,
  moduleServerCommonName: undefined,

  serverRootPathShouldExist: false,
  gitignore: true,

  confFileInitialized: confFileInitialized,
  confFilePath: confFilePath,
  confFileData: confFileData,

  clientSymlinkList: [],
  serverSymlinkList: [],
  modulesSymlinkList: [],

  clientSymlinkListAdd: [],
  serverSymlinkListAdd: [],
  modulesSymlinkListAdd: [],

  clientSymlinkListRemove: [],
  serverSymlinkListRemove: [],
  modulesSymlinkListRemove: [],
};

function setValue(conf1, confKey, rootPath) {
  const confFileValue = conf.confFileData[confKey];
  if(rootPath && confFileValue && confFileValue[0] === '.') {
    conf[confKey] = path.join(rootPath, confFileValue);
  } else {
    conf[confKey] = confFileValue || conf[confKey];
  }
}

setValue(conf, 'rootPath');
setValue(conf, 'clientRootPath', conf.rootPath);
setValue(conf, 'serverRootPath', conf.rootPath);
setValue(conf, 'modulesRootPath', conf.rootPath);
setValue(conf, 'clientSrcPath', conf.clientRootPath);
setValue(conf, 'serverSrcPath', conf.serverRootPath);
setValue(conf, 'nodeModulesPath', conf.clientRootPath);
setValue(conf, 'clientModulesName');
setValue(conf, 'serverModulesName');
setValue(conf, 'serverRootPathShouldExist');
setValue(conf, 'gitignore');
setValue(conf, 'clientSymlinkList');
setValue(conf, 'serverSymlinkList');
setValue(conf, 'modulesSymlinkList');

function showValue(key) {
  console.info(key, ':', conf[key]);
}

function show() {
  console.info('Configuration file :', conf.confFilePath);
  showValue('rootPath');
  showValue('clientRootPath');
  showValue('serverRootPath');
  showValue('modulesRootPath');
  showValue('clientSrcPath');
  showValue('serverSrcPath');
  showValue('nodeModulesPath');
  showValue('clientModulesName');
  showValue('serverModulesName');
  showValue('moduleClientCommonName');
  showValue('moduleServerCommonName');
  showValue('serverRootPathShouldExist');
  showValue('gitignore');
}

function update() {

  conf.clientSymlinkList.removeList(conf.clientSymlinkListRemove).addList(conf.clientSymlinkListAdd);
  conf.serverSymlinkList.removeList(conf.serverSymlinkListRemove).addList(conf.serverSymlinkListAdd);
  conf.modulesSymlinkList.removeList(conf.modulesSymlinkListRemove).addList(conf.modulesSymlinkListAdd);

  conf.confFileData.clientSymlinkList = conf.clientSymlinkList;
  conf.confFileData.serverSymlinkList = conf.serverSymlinkList;
  conf.confFileData.modulesSymlinkList = conf.modulesSymlinkList;
  fs.writeFileSync(conf.confFilePath, JSON.stringify(conf.confFileData, null, 2), 'utf-8');
}

module.exports = conf;
module.exports.watchers = {};
module.exports.watcherActive = false;
module.exports.show = show;
module.exports.update = update;
