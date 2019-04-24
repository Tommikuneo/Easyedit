import { app, BrowserWindow, screen, Menu, ipcMain, session, IpcMessageEvent } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import * as url from 'url';


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


try {
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
