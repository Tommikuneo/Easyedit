import { Injectable, Input } from '@angular/core';
import { ElectronService } from './electron.service';
import { fabric } from 'fabric';
import { fromEvent, merge, Observable, BehaviorSubject, interval, } from 'rxjs';
import { switchMap, mapTo, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ECanvas } from '../classes/fabric/eCanvas';
import { EText } from '../classes/fabric/eText';
import { EImage } from '../classes/fabric/eImage';
import { ICanvas } from '../interfaces/ICanvas';
import { promisify } from 'util';

import { ToastrService } from 'ngx-toastr';

import { TemplateDto } from '../dto/Template.dto';
import { QueueManager } from '../classes/QueueManager';
import { Template } from '../classes/Template';
import { Buffer } from 'buffer';
import { FabricService } from './fabric.service';
import { FontService } from './font.service';
import { MatDialog } from '@angular/material';


@Injectable()
export class FabricEditorService extends FabricService {

  constructor(
    public electronService: ElectronService,
    public dialog: MatDialog,
    protected toastr: ToastrService,
    protected fontService: FontService,
  ) {

    super(electronService, dialog, toastr, fontService);

  }


  //#region UserKeyBindings

  /**
   * Öffnet Dropdown bei spezifischen Objekten
   * @param e Das Maus Event
   */
  onRightClickCanvas(e: MouseEvent) {
    const target: any = this.canvas.findTarget(e, true);
    // Initialisiert neues menü
    const menuItems: Electron.MenuItem[] = [];
    if (target && this.active && target === this.active) {
      const menu = new this.electronService.remote.Menu();

      switch (target.type) {
        case 'i-text':

          break;
        case 'image':

          if ((<EImage>this.active).isPlaceholder) {
            menuItems.push(new this.electronService.remote.MenuItem({
              label: 'Ersetzen',
              click: () => this.replaceImage(<EImage>this.active),
            }));

          }

          break;
      }

      menuItems.forEach(it => menu.append(it));
      // verhindert öffnen einer leeren Menüleiste
      if (menuItems.length !== 0) {
        menu.popup();
      }

    }

  }

  //#endregion UserKeyBindings


}
