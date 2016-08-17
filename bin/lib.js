'use strict';

const fs = require('fs-extra');
const conf = require('./conf');
const platformIsWindows = require('process').platform === 'win32';

function fsExistsSync(filePath) {
  try {
    fs.accessSync(filePath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
module.exports.fsExistsSync = fsExistsSync;

function unlinkSync(path) {
  if(isSymlinkSync(path)) {
    console.info('unlink:', path.substr(conf.rootPath.length+1));
    fs.unlinkSync(path);
  }
}
module.exports.unlinkSync = unlinkSync;

function isSymlinkSync(filePath) {
  try {
    return fs.lstatSync(filePath).isSymbolicLink();
  } catch (e) {
    return false;
  }
}
module.exports.isSymlinkSync = isSymlinkSync;

function isDirNotSymlinkSync(filePath) {
  try {
    return fs.lstatSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}
module.exports.isDirNotSymlinkSync = isDirNotSymlinkSync;

function isDirSync(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e) {
    return false;
  }
}
module.exports.isDirSync = isDirSync;

function mkdirsSync(dirPath) {
  if(!fsExistsSync(dirPath)) {
    console.info('mkdir:', dirPath.substr(conf.rootPath.length+1));
    fs.mkdirsSync(dirPath);
  }
}
module.exports.mkdirsSync = mkdirsSync;

function symlinkSync(targetPath, sourcePath) {
  if(!fsExistsSync(sourcePath)) {
    console.info('symlink:', targetPath.substr(conf.rootPath.length+1), '===>', sourcePath.substr(conf.rootPath.length+1));
    if(isDirSync(targetPath)) {
      if(platformIsWindows) {
        fs.symlinkSync(targetPath, sourcePath, 'junction');
      } else {
        fs.symlinkSync(targetPath, sourcePath, 'dir');
      }
    } else {
      fs.symlinkSync(targetPath, sourcePath, 'file');
    }
  }
}
module.exports.symlinkSync = symlinkSync;

function hasIntersection(array1, array2) {
  for(let array1Value of array1) {
    if(array2.indexOf(array1Value) >= 0) {
      return true;
    }
  }
  return false;
}
module.exports.hasIntersection = hasIntersection;
