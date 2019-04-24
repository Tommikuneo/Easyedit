import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
// Workaround für Typescript zum nutzen von Javascript-Bibliotheken
import * as childProcess from 'child_process';
import { ipcRenderer, remote, webFrame } from 'electron';
import EStore from 'electron-store';
import { fabric } from 'fabric';
import * as fs from 'fs';
import * as path from 'path';
import { ViewChooserDialogComponent } from '../dialogs/view-chooser-dialog.component';

@Injectable()
export class ElectronService {

  // Bereitstellen der Funktionalitäten von Electron Diensten in Angular
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  platform = process.platform;
  fs: typeof fs;
  path = path;
  fsPromises = fs.promises;
  fabric: typeof fabric;
  eStore = new EStore();
  canvas: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
  ) {

      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.fabric = window.require('fabric').fabric;

      // MacOS methode zum abfangen von "Datei öffnen mit"
      this.ipcRenderer.on('open-file', (event, filepath) => {
        console.log(event);
        if (filepath.endsWith('.ee')) {
          this.showViewChooser(filepath);
        }

      });

      // Windows methode zum abfangen von "Datei öffnen mit"
      if (this.remote.process['argv'][1]) {
        const param: string = this.remote.process['argv'][1];
        if (param.endsWith('.ee')) {
          this.showViewChooser(param);
        }
      }
  }

  /**
   * Öffnet ein neues Dialogfenster zum auswählen des Editors
   * @param filePath der Pfad der Datei
   */
  public showViewChooser(filePath: string) {

    const jsonData = this.fs.readFileSync(filePath, 'utf-8');
    const dialog = this.dialog.open(ViewChooserDialogComponent, {
      data: { json: jsonData, action: null }
    });

    dialog.afterClosed().subscribe(result => {
      this.router.navigate([result.action, { filePath: filePath }]);
    });
  }
  
  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
