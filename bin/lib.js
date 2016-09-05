'use strict';

const fs = require('fs-extra');
const conf = require('./conf');
const platformIsWindows = require('process').platform === 'win32';

function pathExists(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function getSymlinkMetadata(targetPath) {
  if (targetPath.startsWith(conf.clientSrcPath)) {
    return { symlinkList: 'clientSymlinkList', symlinkPath: targetPath.substr(conf.clientRootPath.length + 1).replace(/\\/g, '/') };
  } else if (targetPath.startsWith(conf.serverSrcPath)) {
    return { symlinkList: 'serverSymlinkList', symlinkPath: targetPath.substr(conf.serverRootPath.length + 1).replace(/\\/g, '/') };
  } else if (targetPath.startsWith(conf.modulesRootPath)) {
    return { symlinkList: 'modulesSymlinkList', symlinkPath: targetPath.substr(conf.modulesRootPath.length + 1).replace(/\\/g, '/') };
  } else {
    console.warn('Symlink ?', targetPath);
    process.exit();
  }
}

function symlink(targetPath, sourcePath) {
  const symlinkMetadata = getSymlinkMetadata(sourcePath);
  const symlinkPath = sourcePath.substr(conf.rootPath.length + 1);
  if (!pathExists(sourcePath)) {
    console.warn('sourcePath:', sourcePath, 'does not exist !!!');
  } else if (!pathExists(sourcePath)) {
    if (isDir(targetPath)) {
      if (platformIsWindows) {
        fs.symlinkSync(targetPath, sourcePath, 'junction');
      } else {
        fs.symlinkSync(targetPath, sourcePath, 'dir');
      }
    } else {
      try {
        fs.symlinkSync(targetPath, sourcePath, 'file');
      } catch (ex) {
        console.error(ex);
        if(platformIsWindows) {
          console.error('On windows, you must have admin privs');
        }
      }
    }
    if (conf[symlinkMetadata.symlinkList + 'Add'].indexOf(symlinkMetadata.symlinkPath) === -1) {
      conf[symlinkMetadata.symlinkList + 'Add'].push(symlinkMetadata.symlinkPath);
    }
  }
}
module.exports.symlink = symlink;

function unlink(sourcePath) {
  const symlinkMetadata = getSymlinkMetadata(sourcePath);
  const symlinkPath = sourcePath.substr(conf.rootPath.length + 1);
  if (isSymlink(sourcePath)) {
    fs.unlinkSync(sourcePath);
  }
  if (conf[symlinkMetadata.symlinkList + 'Remove'].indexOf(symlinkMetadata.symlinkPath) === -1) {
    conf[symlinkMetadata.symlinkList + 'Remove'].push(symlinkMetadata.symlinkPath);
  }
}
module.exports.unlink = unlink;

function isSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch (e) {
    return false;
  }
}
module.exports.isSymlink = isSymlink;

function isDirNotSymlink(filePath) {
  try {
    return fs.lstatSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}
module.exports.isDirNotSymlink = isDirNotSymlink;

function isDir(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}
module.exports.isDir = isDir;

function mkdirs(dirPath) {
  if (!pathExists(dirPath)) {
    fs.mkdirsSync(dirPath);
  }
}
module.exports.mkdirs = mkdirs;

function hasIntersection(array1, array2) {
  for (let array1Value of array1) {
    if (array2.indexOf(array1Value) >= 0) {
      return true;
    }
  }
  return false;
}
module.exports.hasIntersection = hasIntersection;

Array.prototype.add = function add(value) {
  if(this.indexOf(value) === -1) {
    this.push(value);
  }
}

Array.prototype.addList = function addList(listToAdd) {
  for(let valueName of listToAdd) {
    this.add(valueName);
  }
  return this;
}

Array.prototype.remove = function remove(value) {
  const i = this.indexOf(value);
  if(i >= 0) {
    this.splice(i, 1);
  }
}

Array.prototype.removeList = function removeList(listToRemove) {
  for(let valueName of listToRemove) {
    this.remove(valueName);
  }
  return this;
}
