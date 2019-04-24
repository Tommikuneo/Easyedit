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
export class FabricDesignerService extends FabricService {

  constructor(
    public electronService: ElectronService,
    public dialog: MatDialog,
    protected toastr: ToastrService,
    protected fontService: FontService,
  ) {

    super(electronService, dialog, toastr, fontService);

    fabric['DPI'] = 1000;
  }


  /**
   * Fügt dem Canvas Element die Eventlisteners hinzu
   * @param canvas das Fabricjs Canvas Element
   */
  initializeCanvas(canvas: ECanvas) {
    this.canvas = canvas;


    const movingEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'object:moving'),
    textChangeEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'text:changed'),
    modifiedEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'object:modified'),
    updateEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'selection:updated'),
    selectedEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'object:selected'),
    selectionClearedEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'selection:cleared'),

    // objectClickedEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'mouse:down'),
    objectScrolledEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'mouse:wheel');

    // rightClickMenu: Observable<any> = fromEvent(window, 'contextmenu');

    merge(updateEvent, selectedEvent).subscribe( e => this.updateView(e));
    selectionClearedEvent.subscribe( e => { this.active = null; this.activeObservable.next(null); } );


    merge(textChangeEvent, movingEvent, modifiedEvent, updateEvent).pipe(
      debounceTime(100),
       distinctUntilChanged(),
    ).subscribe( e => this.canvas.queueManager.state = this.canvas.toDatalessJSON(this.canvasExportParameter));

    objectScrolledEvent.subscribe(e =>  this.onScrolledCanvas(e));

    // rightClickMenu.subscribe( e => console.log(e));
    // objectClickedEvent.subscribe( e => console.log(e));
    /*
    this.canvas.on({
      'object:moving': (e) => { },
      'object:modified': (e) => { },
      'selection:updated': (e) => this.updateView(e),
      'object:selected': (e) => this.updateView(e),
      'selection:cleared': (e) => {
        this.active = null;
        this.activeObservable.next(null);
      }
    });
    */
  }




/*------------------------User Keybindings------------------------*/
  //#region UserKeyBindings




  //#endregion UserKeyBindings

//#region Object Initialization
  /*------------------------Object Initialization------------------------*/

  addText(textString: string) {
    // const text = new fabric.IText(textString, {
      const text = new EText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'Helvetica',
      angle: 0,
      fill: '#000000',
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      fontWeight: '',
      charSpacing: 20,
      lockUniScaling : true,
      hasRotatingPoint: true,
      lockScalingX: true,
      lockScalingY: true,

    });
    text.setControlsVisibility({tl: false, tr: false, bl: false, br: false});
    text['snapAngle'] = 15;
    // this.extendID(text, this.randomId());
    // , kind: 'Headline'
    // this.extend(text, {id: this.randomId()});
    text.id = this.randomId();
    console.log(text);

    this.canvas.add(text);
    this.canvas.selectItem(text);
    // this.textString = '';


  }


//#endregion Object Initialization

  //#region IO Operations
  /*------------------------IO Operations------------------------*/


  saveCanvasToImage() {

    const raw = this.canvas.toDataURL({ format: 'png', multiplier: 1 });
    const i = raw.replace(/^data:image\/png;base64,/, '');
    this.electronService.remote.dialog.showSaveDialog(null, { filters: [{ name: 'png', extensions: ['png']}] },
      (filePath) => {

        if (filePath === undefined) {
          return;
        }
        const infoToast = this.toastr.info('saving Template', undefined , { disableTimeOut: true});

        this.electronService.fs.writeFile(filePath + 'a', i, { encoding: 'base64' }, (err) => {

          if (!err) {
             infoToast.toastRef.close();
            this.toastr.success('Die Datei wurde gespeichert');
          } else {
            infoToast.toastRef.close();
            this.electronService.remote.dialog.showErrorBox('Dateispeicherfehler', err.message);
          }
        });


      });
  }


  //#endregion IO Operations
}
