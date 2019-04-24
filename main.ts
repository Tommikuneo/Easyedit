import { app, BrowserWindow, screen, Menu, ipcMain, session, IpcMessageEvent } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import * as url from 'url';
import { MyMenu } from './menu';
import { autoUpdater } from 'electron-updater';
import { Facebook } from './src/app/classes/publish/facebook';
import { Twitter } from './src/app/classes/publish/twitter';

let win: BrowserWindow;
let serve;
const args = process.argv.slice(1);
let filePath: string;
let ready = false;
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    title: 'Easyedit',
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: { webSecurity: false },

  });

 // const menu = Menu.buildFromTemplate(MyMenu);
  // Menu.setApplicationMenu(menu);


  if (isDev) {

    if (process.platform !== 'darwin') {
      // tslint:disable-next-line:max-line-length
      // BrowserWindow.addDevToolsExtension('C:/Users/tgerl/AppData/Local/Google/Chrome/User Data/Default/Extensions/elgalmkoelokbchhkhacckoklkejnhcd/1.22.0_0');

    }
    try {

    } catch (error) {

    }
    win.webContents.openDevTools();
  }

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    console.log(__dirname);

    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));


    win.webContents.on('did-finish-load', () => {
      ready = true;
      if (filePath) {
          win.webContents.send('open-file', filePath);
          filePath = null;
      }
  });

}

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });



}


  // Erstelle Facebook login Fenster
  ipcMain.on('fb-authenticate', (event: IpcMessageEvent, loginURL: string) => {

    const authWindow = new BrowserWindow({
      width: 450,
      height: 300,
      show: false,
      modal: true,
      webPreferences: {
        nodeIntegration: false
      }
    });

    authWindow.loadURL(loginURL);
    authWindow.webContents.on('did-finish-load', () => {
      authWindow.show();
    });

    const handleUrl = async (fbUrl: string) => {
      console.log(fbUrl);
      const redirectURL = new URL(fbUrl);
      const code = redirectURL.searchParams.get('code');

      win.webContents.send('fb-authenticated', code);
      authWindow.close();

      };

    authWindow.webContents.on('will-navigate', (event, fbUrl) => handleUrl(fbUrl));
    const filter = {
      urls: ['https://www.facebook.com/connect/login_success.html' + '*']
    };
    session.defaultSession.webRequest.onCompleted(filter, (details) => {
      const fbUrl = details.url;
      handleUrl(fbUrl);
    });

  });

// Auto update
try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
      // if (process.platform !== 'darwin') {
      app.quit();
      // }
  });


  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  // Datei öffne mit unterstützung von MacOS
  app.on('open-file', (event: Event, filepath: string) => {
    event.preventDefault();

    filePath = filepath;

    if (ready) {
        win.webContents.send('open-file', filePath);
        filePath = null;
    }

  });

} catch (e) {
  console.log(e);

}



///////////////////
// Auto upadater //
///////////////////
autoUpdater.requestHeaders = { 'PRIVATE-TOKEN': '3ZUFKywTznqui-xiLPiF' };
autoUpdater.autoDownload = true;

if (process.platform === 'darwin') {

  autoUpdater.setFeedURL({
    provider: 'generic',
    // url: 'https://gitlab.com/tommiku/oberstufenprojekt/-/jobs/157318779/artifacts/file/dist/latest.yml'
    url: 'http://vip.zuk.de/thomas/release Abschlussprojekt/release/dist'
});

} else {
  autoUpdater.setFeedURL({
    provider: 'generic',
    // url: 'https://gitlab.com/tommiku/oberstufenprojekt/-/jobs/157318779/artifacts/file/dist/latest.yml'
    url: 'https://gitlab.com/api/v4/projects/10395755/jobs/artifacts/master/raw/dist?job=build'
});
}


autoUpdater.on('checking-for-update', function () {
    sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', function (info) {
    sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
    sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', function (err) {
    sendStatusToWindow('Error in auto-updater.');
});

autoUpdater.on('download-progress', function (progressObj) {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', function (info) {
    sendStatusToWindow('Update downloaded; will install in 1 seconds');
});

autoUpdater.on('update-downloaded', function (info) {
    setTimeout(function () {
        autoUpdater.quitAndInstall();
    }, 1000);
});

if (false) {
autoUpdater.checkForUpdates();
}
function sendStatusToWindow(message) {
    console.log(message);
}


