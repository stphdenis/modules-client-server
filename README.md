# modules-client-server

This package structure your project so you can have your client, server and modules in different places.

## Default configuration

We make a separation bitween client, server and modules
```
┌── client
├── modules
└── server
```

Each module itself has a separation bitween client, server and common files
```
──┬ modules
  └─┬ moduleXXX
    ├── client
    ├── common
    └── server
```

For a module, common files and directories are symlinked to client and server
```
──┬ modules
  └─┬ moduleXXX
    ├─┬ client
    | ├── clientFILE.js
    | ├── clientDIR
    | ├── commonFILE.js  <=symlink=> ./common/commonFILE.js
    | └── commonDIR      <=symlink=> ./common/commonDIR
    ├─┬ common
    | ├── commonFILE.js
    | └── commonDIR
    └─┬ server
      ├── serverFILE.js
      ├── serverDIR
      ├── commonFILE.js  <=symlink=> ./common/commonFILE.js
      └── commonDIR      <=symlink=> ./common/commonDIR
```

And finaly, client of the module is symlinked to the client source and server of the module is symlinked to the server source
```
┌─┬ client
| └─┬ src
|   └── moduleXXX <=symlink=> modules/moduleXXX/client
├─┬ modules
| └─┬ moduleXXX
|   ├── client
|   ├── common
|   └── server
└─┬ server
  └─┬ src
    └── moduleXXX <=symlink=> modules/moduleXXX/server
```

So, at the end, we have
```
┌─┬ client
| └─┬ src
|   └─┬ moduleXXX
|     ├── clientFILE.js
|     ├── clientDIR
|     ├── commonFILE.js
|     └── commonDIR
├── modules...
└─┬ server
  └─┬ src
    └─┬ moduleXXX
      ├── serverFILE.js
      ├── serverDIR
      ├── commonFILE.js
      └── commonDIR
```

## How to use by default

You can create a `modules-client-server.conf.json` file if you have other preferences. You have to execute a command in the same directory as the configuration file if it is defined.

Fist, install the package as global :
```
npm install -g modules-client-server
```

So as a sample :
```
mkdir sampleProj
cd sampleProj
modules-client-server --init --add moduleXXX
cd modules\moduleXXX
echo // > client\clientFILE.js
mkdir     client\clientDIR
echo // > server\serverFILE.js
mkdir     server\serverDIR
echo // > common\commonFILE.js
mkdir     common\commonDIR
```

Each time you add or remove common files or directories you have to sync them with client and server side :

```
modules-client-server --sync
```

Or you can automate it :
```
modules-client-server --watch
```
While watching, you can use an other console to add or remove modules.

NOTA BENE: for Windows, if you have files in the root of your common module directory your console MUST be executed as Administrator. Directories are OK.

## Parameter file : `modules-client-server.conf.js`

The commands are to be done where is the parameter file.

You can change where client, server or common directories are on your system.

The `--conf` command show you the current configuration.

- `rootPath` : used if `clientRootPath`, `serverRootPath` or `modulesRootPath` have relative paths
- `clientRootPath`  : root path of the client (can be relative to `rootPath`)
- `serverRootPath`  : root path of the server (can be relative to `rootPath`)
- `modulesRootPath` : root path of the modules (can be relative to `rootPath`)
- `clientSrcPath`   : src path of the client (can be relative to `clientRootPath`)
- `nodeModulesPath` : `node_modules` path of the modules (can be relative to `clientRootPath`)
- `serverSrcPath`   : src path of the server (can be relative to `serverRootPath`)
- `serverRootPathShouldExist` : the server must exist before `--init`
- `clientModulesName` : name of the directory where all modules have to be under `clientSrcPath` if defined
- `serverModulesName` : name of the directory where all modules have to be under `serverSrcPath` if defined
- `moduleClientCommonName` : name of the directory where all common ressources of each modules have to be for the client side if defined
- `moduleServerCommonName` : name of the directory where all common ressources of each modules have to be for the server side if defined

If `moduleClientCommonName` and `moduleServerCommonName` are both used, you don't have to use `--sync`.

### To have this configuration :
```
┌─┬ client
| └─┬ src
|   └─┬ modulesS
|     └─┬ moduleXXX
|       ├── clientFILE.js
|       ├── clientDIR
|       ├── commonFILE.js
|       └── commonDIR
├── modules...
└─┬ server
  └─┬ src
    └─┬ modulesC
      └─┬ moduleXXX
        ├── serverFILE.js
        ├── serverDIR
        ├── commonFILE.js
        └── commonDIR
```
`modules-client-server.conf.js` file :
```json
{
  "clientModulesName": "modulesS",
  "serverModulesName": "modulesN"
}
```

### To have this configuration :
```
┌─┬ client
| └─┬ src
|   └─┬ £
|     └─┬ moduleXXX
|       ├── clientFILE.js
|       ├── clientDIR
|       └─┬ #
|         ├── commonFILE.js
|         └── commonDIR
├── modules...
└─┬ server
  └─┬ src
    └─┬ modulesC
      └─┬ moduleXXX
        ├── serverFILE.js
        ├── serverDIR
        └─┬ $
          ├── commonFILE.js
          └── commonDIR
```
`modules-client-server.conf.js` file :
```json
{
  "clientModulesName": "£",
  "serverModulesName": "modulesC",
  "moduleClientCommonName": "#",
  "moduleServerCommonName": "$"
}
```
