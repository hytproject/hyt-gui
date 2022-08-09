# Holoyolo Electron GUI Wallet

![Screenshot](https://i.imgur.com/Z4pHcA7.jpg "Screenshot")

### Introduction
Holoyolo is a private cryptocurrency based on Monero. Holoyolo aims to provide everyone the ability to mine and transact with ease and security.
More information on the project can be found on the [website](https://Holoyoloproject.io).

### About this project

This is the new electron GUI for Holoyolo. It is open source and completely free to use without restrictions, anyone may create an alternative implementation of the Holoyolo Electron GUI that uses the protocol and network in a compatible manner.
Please submit any changes as pull requests to the development branch, all changes are assessed in the development branch before being merged to master, release tags are considered stable builds for the GUI.

#### Pre-requisites
- Download latest [Holoyolod](https://github.com/Holoyolo-network/Holoyolo/releases/latest)

#### Commands
```
nvm use 11.9.0
npm install -g quasar-cli
https://github.com/Holoyolo-network/Holoyolo-electron-gui/
cd Holoyolo-electron-wallet
cp path_to_Holoyolo_binaries/Holoyolod bin/
cp path_to_Holoyolo_binaries/Holoyolo-wallet-rpc bin/
npm install
```

For dev:
```
npm run dev
```

For building:

**Note:** This will only build the binaries for the system you run the command on. Running this command on `linux` will only make `linux` binaries, no `mac` or `windows` binaries.
```
npm run build
```