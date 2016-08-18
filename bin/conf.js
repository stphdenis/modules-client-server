'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultConf() {

  const rootPath = path.resolve();

  const clientRootPath = path.join(rootPath, 'client');
  const modulesRootPath = path.join(rootPath, 'modules');
  const serverRootPath = path.join(rootPath, 'server');

  const clientSrcPath = path.join(clientRootPath, 'src');
  const nodeModulesPath = path.join(clientRootPath, 'node_modules');
  const serverSrcPath = path.join(serverRootPath, 'src');

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
  return {
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
  };
}

function getConf() {
  const conf = getDefaultConf();
  conf.pathConf = path.join(conf.rootPath, 'modules-client-server.conf.json');
  console.info('--------------- conf.pathConf :', conf.pathConf);

  try {
    console.info('--------------- try');
    fs.accessSync(conf.pathConf, fs.F_OK);
  } catch (e) {
    console.info('--------------- catch');
    conf.pathConf = undefined;
  }
  console.info('--------------- conf.pathConf :', conf.pathConf);

  let localConf;
  if(conf.pathConf) {
    localConf = JSON.parse(fs.readFileSync(conf.pathConf));
  } else {
    localConf = {};
  }

  function setConfValue(confKey, rootPath) {
    console.info('confKey :', confKey);
    console.info('rootPath :', rootPath);
    const localConfValue = localConf[confKey];
    console.info('localConf[confKey] :', localConfValue);
    if(rootPath && localConfValue && localConfValue[0] === '.') {
      console.info('conf[confKey] :', path.join(rootPath, localConfValue));
      conf[confKey] = path.join(rootPath, localConfValue);
    } else {
      conf[confKey] = localConfValue || conf[confKey];
      console.info('final conf[confKey] :', conf[confKey]);
    }
  }

  setConfValue('rootPath');
  setConfValue('clientRootPath', conf.rootPath);
  setConfValue('modulesRootPath', conf.rootPath);
  setConfValue('serverRootPath', conf.rootPath);
  setConfValue('clientSrcPath', conf.clientRootPath);
  setConfValue('nodeModulesPath', conf.clientRootPath);
  setConfValue('serverSrcPath', conf.serverRootPath);
  setConfValue('clientModulesName');
  setConfValue('serverModulesName');
  setConfValue('moduleClientCommonName');
  setConfValue('moduleServerCommonName');
  setConfValue('serverRootPathShouldExist');

  return conf;
}

function showConfValue(key) {
  console.info(key, ':', module.exports[key]);
}

function showConf() {
  console.info('Configuration file :', module.exports.pathConf);
  showConfValue('rootPath');
  showConfValue('clientRootPath');
  showConfValue('modulesRootPath');
  showConfValue('serverRootPath');
  showConfValue('clientSrcPath');
  showConfValue('nodeModulesPath');
  showConfValue('serverSrcPath');
  showConfValue('clientModulesName');
  showConfValue('serverModulesName');
  showConfValue('moduleClientCommonName');
  showConfValue('moduleServerCommonName');
  showConfValue('serverRootPathShouldExist');
}

module.exports = getConf();
module.exports.watchers = {};
module.exports.watcherActive = false;
module.exports.showConf = showConf;
