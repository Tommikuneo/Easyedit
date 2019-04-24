import { MatDialog } from '@angular/material';
import { Buffer } from 'buffer';
import { fabric } from 'fabric';
import { ToastrService } from 'ngx-toastr';
import { basename } from 'path';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ECanvas } from '../classes/fabric/eCanvas';
import { EImage } from '../classes/fabric/eImage';
import { EText } from '../classes/fabric/eText';
import { QueueManager } from '../classes/QueueManager';
import { Template } from '../classes/Template';
import { TemplateDto } from '../dto/Template.dto';
import { ICanvas } from '../interfaces/ICanvas';
import { ILoadedFont } from '../interfaces/ILoadedFont';
import { ElectronService } from './electron.service';
import { FontService } from './font.service';


export class FabricService {

  public canvas: ECanvas;
  protected active: fabric.Object;
  public activeObservable: BehaviorSubject<fabric.Object> = new BehaviorSubject(null);
  public loadedFonts: BehaviorSubject<ILoadedFont[]> = new BehaviorSubject([]);
  public queueManager = new QueueManager();
  protected menu: Electron.Menu;

  // Setzt Globale zu Serialisierende Attribute der Arbeitsfläche fest
  protected canvasExportParameter =
    ['height', 'width', 'id', 'isPlaceholder', 'lockMovementX', 'lockMovementY', 'hasControls', 'projectName'];

  constructor(
    public electronService: ElectronService,
    public dialog: MatDialog,
    protected toastr: ToastrService,
    protected fontService: FontService,
  ) {
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

      objectScrolledEvent: Observable<fabric.IEvent> = fromEvent(this.canvas, 'mouse:wheel');


    merge(updateEvent, selectedEvent).subscribe(e => this.updateView(e));
    selectionClearedEvent.subscribe(e => { this.active = null; this.activeObservable.next(null); });


    merge(textChangeEvent, movingEvent, modifiedEvent, updateEvent).pipe(
      debounceTime(100),
      distinctUntilChanged(),
    ).subscribe(e => this.canvas.queueManager.state = this.canvas.toDatalessJSON(this.canvasExportParameter));

    objectScrolledEvent.subscribe(e => this.onScrolledCanvas(e));

  }




  /*------------------------User Keybindings------------------------*/
  //#region UserKeyBindings


  // MISSING OPTION SEND BACKWARS SEND TO BACK

  onRightClickCanvas(e: MouseEvent) {
    const target: any = this.canvas.findTarget(e, true);
    const menuItems: Electron.MenuItem[] = [];

    if (target && this.active && target === this.active) {
      const menu = new this.electronService.remote.Menu();
      menuItems.push(
        new this.electronService.remote.MenuItem({
          label: 'Allgemeines',
          submenu: [
            {
              label: 'Löschen',
              click: () => this.removeSelected(),
            },
            {
              label: 'Nach hinten verschieben',
              click: () => this.sendToBack(),
            },
            {
              label: 'Nach vorne verschieben',
              click: () => this.bringToFront(),
            },
            {
              label: 'Klonen',
              click: () => this.clone(),
            }
          ],
        }),
        new this.electronService.remote.MenuItem({
          label: 'Ausrichtung',
          submenu: [
            {
              label: 'Zentriert',
              click: () => this.active.center(),
            },
            {
              label: 'Vertikal',
              click: () => this.active.centerH(),
            },
            {
              label: 'Horizontal',
              click: () => this.active.centerV(),
            },
            {
              label: 'Rotation zurücksetzen',
              click: () => { this.active.rotate(0); this.canvas.renderAll(); },
            }
          ],
        })
      );

      switch (target.type) {
        case 'i-text':
          const el: EText = target as EText;

          break;
        case 'image':

          break;
      }

      menuItems.push(new this.electronService.remote.MenuItem({
        label: 'Log Element',
        click: () => {
          console.log(target);
        }
      }));
      menuItems.forEach(it => menu.append(it));

      menu.popup();

    }

  }

  onScrolledCanvas(ev: fabric.IEvent) {
    const mouseEv: WheelEvent = ev.e as WheelEvent;
    if (ev.target && this.active && ev.target === this.active && mouseEv.ctrlKey) {
      mouseEv.preventDefault();
      switch (ev.target.type) {
        case 'i-text':
          const el: EText = ev.target as EText;
          const newSize = (mouseEv.deltaY < 0) ? el.fontSize + 1 : el.fontSize - 1;
          this.setFontSize(newSize);
          break;
        case 'image':
          const newScale = (mouseEv.deltaY < 0) ? ev.target.scaleX * 1.10 : ev.target.scaleX * 0.90;
          this.setScale(newScale);

          break;
      }
      console.log(ev.target);
    }
  }

  // MISSING BINDING DEL FOR DELETE

  //#endregion UserKeyBindings

  //#region Set View Function
  /*------------------------Set View Function------------------------*/

  updateView(e: fabric.IEvent) {
    this.active = e.target;
    this.activeObservable.next(this.active);
    // this.queueManager.state = JSON.stringify(this.canvas);

    // this.selected = selectedObject;
    this.active.hasRotatingPoint = true;
    this.active.transparentCorners = false;
    // selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

    // this.resetPanels();

    if (this.active.type !== 'group' && this.active) {

      // this.getId();
      // this.getOpacity();



      switch (this.active.type) {
        case 'rect':
        case 'circle':
        case 'triangle':
          // this.figureEditor = true;
          // this.getFill();
          break;
        case 'i-text':
          /*
            this.textEditor = true;
            this.getFontSize();
            this.getLineHeight();
            this.getCharSpacing();
            this.getBold();
            this.getFontStyle();
            this.getFill();
            this.getTextDecoration();
            this.getTextAlign();
            this.getFontFamily();
            */
          break;
        case 'image':
          // this.imageEditor = true;

          // this.getScale();
          break;
      }
    }
  }

  //#endregion Set View Function

  //#region GETTER SETTER
  /*------------------------GETTER SETTER------------------------*/

  getId = (): any => this.active['id'];


setId(id: number) {
  const complete = this.active.toObject();
  this.canvas.getActiveObject().toObject = () => {
    complete.id = id;
    return complete;
  };
}

getLeft = () => Math.round(( (this.getCenterPoint().x) / this.canvas.getWidth() ) * 100 ) ;

setLeft(percentXPosition: number) {

  const elPosLeft = this.canvas.getWidth() * ( percentXPosition / 100 ) - this.getHalfWidth();
  const rot = this.active.angle;
  this.active.rotate(0);
  this.active.left = elPosLeft;
  // this.active.setPositionByOrigin(
  //  new this.electronService.fabric.Point(elPosLeft, y ),
  //  this.active.originX, this.active.originY);
  this.active.rotate(rot);

  this.active.setCoords();
  this.canvas.renderAll();
}

getTop = () => Math.round(( (this.getCenterPoint().y) / this.canvas.getHeight() ) * 100 ) ;

setTop(percentYPosition: number) {

  const elPosTop = this.canvas.getHeight() * ( percentYPosition / 100 ) - this.getHalfHeight();
  const rot = this.active.angle;
  this.active.rotate(0);
  this.active.top = elPosTop;
  // this.active.setPositionByOrigin(
  //  new this.electronService.fabric.Point(elPosLeft, y ),
  //  this.active.originX, this.active.originY);
  this.active.rotate(rot);

  this.active.setCoords();
  this.canvas.renderAll();
}

getCenterPoint = () => this.active.getCenterPoint();

getHalfWidth = () => (this.active['width'] * this.active['scaleX']) / 2;

getHalfHeight = () => (this.active['height'] * this.active['scaleY']) / 2;

setControls = (e: any) => this.updateStyle('hasControls', !this.active['hasControls']);

setMovementX = (e: any) => this.updateStyle('lockMovementX', !this.active['lockMovementX']);

setMovementY = (e: any) => this.updateStyle('lockMovementY', !this.active['lockMovementY']);

getOpacity = () => this.active.opacity * 100;

setOpacity = (val: number) => this.updateStyle('opacity', val / 100);

setFill = (val: string) => this.updateStyle('fill', val);

setLineHeight = (val: number) => this.updateStyle('lineHeight', val);

setCharSpacing = (val: number) => this.updateStyle('charSpacing', val);

setFontSize = (val: number) => this.updateStyle('fontSize', val);

setBold = () => this.updateStyle('fontWeight', (this.active['fontWeight'] === '' ) ? 'bold' : '' );

getFontStyle = (): boolean => this.active['fontStyle'] === 'italic';

setFontStyle = () => this.updateStyle('fontStyle', (this.active['fontStyle'] !== 'italic' ) ? 'italic' : '' );

setUnderline = () => this.updateStyle('underline', (!this.active['underline']));

setOverline = () => this.updateStyle('overline', (!this.active['overline']));

setLinethrough = () => this.updateStyle('linethrough', (!this.active['linethrough']));

setTextGrow(dir: string) {
  const x = this.active.originX,
  y = this.active.originY,
  // @ts-ignore
  point = this.active.getPointByOrigin(x, y);

  this.updateStyle('originX', (dir));
  // this.updateStyle('originY', (dir));
  this.active.setPositionByOrigin(point, x, y );
  this.active.setCoords();
  this.canvas.renderAll();
}


setTextDecoration(value) {
/*  let iclass = this.props.TextDecoration;
  if (iclass.includes(value)) {
    iclass = iclass.replace(RegExp(value, 'g'), '');
  } else {
    iclass += ` ${value}`;
  }
  this.props.TextDecoration = iclass;
  this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  */
}


setTextAlign(val: string) {
  this.updateStyle('textAlign', val);
  // this.updateStyle('originX', val);
  // this.updateStyle('originY', val);
}

setFontFamily = (val: string) => this.updateStyle('fontFamily', val);

setScale(val: number) {
  this.updateStyle('scaleX', val);
  this.updateStyle('scaleY', val);
}

//#endregion GETTER SETTER

//#region Object Initialization
  /*------------------------Object Initialization------------------------*/

  addText(textString: string) {
    // const text = new fabric.IText(textString, {
      const text = new EText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'helvetica',
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


  addImageOnCanvas(url) {
    if (url) {

     fabric.util.loadImage(url, (img) => {

      const h = this.canvas.getHeight() / img.width;
      const v = this.canvas.getWidth() / img.height;
      const r = Math.min ( h, v );

        const image = new EImage(img, {
          left: 10,
          top: 10,
          angle: 0,
          padding: 0,
          strokeWidth: 0,
        //  cornersize: 10,
          lockUniScaling : true,
          hasRotatingPoint: true,

        });

        console.log(r);

        image.scale(r);
        // image.setHeight(200);

        image.id = this.randomId();
        console.log(image);
        this.canvas.add(image);
      });
    }
  }

  


  /**
   * Fügt ein Platzhalterbild in das Canvas hinein
   */
  addPlaceholder() {

    fabric.util.loadImage('assets/images/placeholder/placeholder.svg', (img) => {


      // Versuch das Bild zum Dynamischen Canvas Passend zu Skalieren
      const h = this.canvas.getHeight() / img.width;
      const v = this.canvas.getWidth() / img.height;
      const r = Math.min(h, v);

      const image = new EImage(img, {
        left: 10,
        top: 10,
        angle: 0,
        padding: 0,
        strokeWidth: 0,
      });

      image.scale(r);

      image.id = this.randomId();
      // Setzt das Bild als Platzhalter
      image.isPlaceholder = true;
      this.canvas.add(image);
    });
  }


  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      return reader;
    }
  }



  //#endregion Object Initialization

  //#region CANVAS Utilitys
  /*------------------------CANVAS Utilitys------------------------*/

  cleanSelect() {
    this.canvas.discardActiveObject().renderAll();
  }

  selectItem(obj: fabric.Object) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }


  setCanvasImage(canvasImage) {
    this.canvas.setBackgroundImage(canvasImage, () => this.canvas.renderAll());
  }


  bringToFront() {
    const activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      activeObject.bringForward();
      // activeObject.opacity = 1;
    } else if (activeGroup) {
      const objectsInGroup = activeGroup; // .getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.bringForward();
      });
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      // this.canvas.sendBackwards(activeObject);
      activeObject.sendBackwards();

    } else if (activeGroup) {
      const objectsInGroup = activeGroup; // .getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.sendBackwards();
      });
    }
  }


  restorePrevious = () => this.canvas.restorePrevious();

  restoreNext = () => this.canvas.restoreNext();


  //#endregion CANVAS Utilitys

  //#region Object Utilitys
  /*------------------------Object Utilitys------------------------*/


  clone() {
    const activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'rect':
          clone = new fabric.Rect(activeObject.toObject());
          break;
        case 'circle':
          clone = new fabric.Circle(activeObject.toObject());
          break;
        case 'triangle':
          clone = new fabric.Triangle(activeObject.toObject());
          break;
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          console.log(activeObject.toObject());
          console.log(clone);


          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
      }
      if (clone) {
        clone.set({ left: 10, top: 10 });
        this.canvas.add(clone);
        // this.selectItemAfterAdded(clone);
      }
    }
  }

  removeSelected() {
    const activeObject = this.canvas.getActiveObject(),
      activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    } else if (activeGroup) {
      const objectsInGroup = activeGroup; // .getObjects();
      this.canvas.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        this.canvas.remove(object);
      });
    }
  }

updateStyle(styleName: string, value: any) {
  const object: any = this.active;

  if (object.setSelectionStyles && object.isEditing) {
    const style = {};
    style[styleName] = value;
    object.setSelectionStyles(style);
    object.setCoords();
  } else {
    object.set(styleName, value);
  }

  object.setCoords();
  this.canvas.renderAll();
}



  extend(obj: fabric.Object , values: object) {

    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), values);
      };
    })(obj.toObject);
  }


  randomId(): number {
    return Math.floor(Math.random() * 999999) + 1;
  }

  //#endregion Object Utilitys


  //#endregion CANVAS Utilitys

  //#region IO Operations
  /*------------------------IO Operations------------------------*/


  /**
   * Speichert das Template auf die Festplatte 
   * @param canvas Modifiziertes Canvas Element
   */
  saveCanvasToJSON(canvas: ECanvas) {

    this.saveFileDialog({ filters: [{ name: 'zuk. Template', extensions: ['ee'] }] }).then(
      (filePath) => {
        const infoToast = this.toastr.info('saving Template', undefined, { disableTimeOut: true });
        this.saveTemplate(canvas, filePath)
          .then(() => {
            infoToast.toastRef.close();
            this.toastr.success('Die Datei wurde gespeichert');
          })
          .catch((err) => {
            infoToast.toastRef.close();
            this.electronService.remote.dialog.showErrorBox('Dateispeicherfehler', err.message);
          });
      }
    );

  }

  /**
   * Speichert das Template auf die Festplatte ohne Auswahl-Dialog
   * 
   * @param canvas Modifiziertes Canvas Element
   * @param path Speicherpfad
   */
  saveOverrideCanvasToJSON(canvas: ECanvas, path: string) {

    if (path) {
      console.log('toast');

      const infoToast = this.toastr.info('saving Template', undefined, { disableTimeOut: true });
      this.saveTemplate(canvas, path)
        .then(() => {
          console.log('toast-close');
          infoToast.toastRef.close();
          this.toastr.success('Die Datei wurde gespeichert');
        })
        .catch((err) => {
          infoToast.toastRef.close();
          this.electronService.remote.dialog.showErrorBox('Dateispeicherfehler', err.message);
        });

    } else { this.saveCanvasToJSON(canvas); }

  }

  /**
   *
   * @param canvas Modifiziertes Canvas Element
   * @param path Speicherpfad
   *
   * @returns promise
   */
  async saveTemplate(canvas: ECanvas, path: string): Promise<void> {

    const template = Template.create(
      canvas.toDatalessJSON(this.canvasExportParameter), canvas.queueManager as QueueManager, this.loadedFonts.value);
    const templateDto = template.toDto();
    // console.log(templateDto);

    const templateJson = JSON.stringify(templateDto);
    return this.electronService.fsPromises.writeFile(path, templateJson);
  }


  /**
   * Speichert das CAnvas Element als PNG auf die Festplatte
   */
  saveCanvasToImage() {
    // Konvertiert Canvas in ein HTML Inline Bild
    const raw = this.canvas.toDataURL({ format: 'png', multiplier: 1 });
    // Ersetzt die inline anweisungen zum Speichern
    const i = raw.replace(/^data:image\/png;base64,/, '');
    this.saveFileDialog({ filters: [{ name: 'png', extensions: ['png'] }] }).then(
      (filePath) => {

        const infoToast = this.toastr.info('saving Template', undefined, { disableTimeOut: true });

        // Initialisiert Speichervorgang
        this.electronService.fs.writeFile(filePath, i, { encoding: 'base64' }, (err) => {

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


  /**
   * Initialisiert das Laden von einer .ee Datei mit dialog
   * @param canvas das HTML Canvas
   * 
   * @returns den Pfad des Templates und das Canvas als Objekt
   */
  loadCanvasFromJSON(canvas: ECanvas): Promise<{ filePath: string, canvas: ICanvas }> {

    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [
        {
          name: 'zuk. Template',
          extensions: ['ee'],
        }
      ],
    };

    const dialog = new Promise<{ filePath: string, canvas: ICanvas }>((resolve, reject) => {

      this.electronService.remote.dialog.showOpenDialog(options,
        async (filePaths) => {
          if (filePaths === undefined) {
            return;
          }

          const filePath = filePaths[0];
          console.log(filePath);
          try {

            const can = await this.loadCanvasFromTemplate(filePath, canvas);
            resolve({ filePath: filePath, canvas: can });

          } catch (err) {
            console.log('Error reading the file: ' + JSON.stringify(err));
            reject(err);
          }

        });
    });


    return dialog;
  }


  /**
   * Läd das HTML Canvas von einer .ee Datei ohne Dialog
   * @param filePath Pfad zum Template
   * @param canvas Die Canvas Referenz der Website
   */
  async loadCanvasFromTemplate(filePath: string, canvas: ECanvas): Promise<ICanvas> {

    const dto: TemplateDto = JSON.parse(this.electronService.fs.readFileSync(filePath, 'utf-8'));
    const template: Template = Template.fromDto(dto);
    const can: ICanvas = template.canvas;
    await this.loadRegisterFont(template.fonts);
    canvas.loadFromJSON(template.canvas, async () => {

      canvas.queueManager = template.queueManager;
      canvas.setWidth(can.width);
      canvas.setHeight(can.height);
      canvas.renderAll();

      const objects = canvas.getObjects();

      objects.forEach((o) => {
        // Läd Standarteinstellungen für Bearbeitung
        switch (o.type) {
          case 'i-text':
            o.lockScalingX = o.lockScalingY = true;
            o.lockUniScaling = o.hasRotatingPoint = true;
            o.setControlsVisibility({ tl: false, tr: false, bl: false, br: false });
            o['snapAngle'] = 15;
            break;
          case 'image':
            o.lockUniScaling = o.hasRotatingPoint = true;
            break;
        }
      });
      // Rendert alles
      canvas.renderAll();

    });

    return can;

  }


  /**
   * 
   * @param placeholder Das Platzhalter Bildobjekt
   */
  replaceImage(placeholder: EImage) {

    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [
        {
          name: 'Bild',
          extensions: ['png', 'jpeg'],
        },
      ],
    };

    this.openFileDialog(options).then(
      (filePath) => {

        fabric.util.loadImage(filePath, (img) => {

          const h = this.canvas.getHeight() / img.width;
          const v = this.canvas.getWidth() / img.height;
          const r = Math.min(h, v);

          const image = new EImage(img, {
            left: placeholder.left,
            top: placeholder.top,
            angle: 0,
            padding: 0,
            strokeWidth: 0,
            //  cornersize: 10,
            lockUniScaling: true,
            hasRotatingPoint: true,

          });

          image.scale(r);
          // image.setHeight(200);

          image.id = this.randomId();

          this.canvas.remove(placeholder);
          this.canvas.add(image);
        });

      }
    );

  }


  /**
   * Fügt mit Dialog neue Schriftarten hinzu
   */
  addNewFont() {

    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [
        {
          name: 'Font',
          extensions: ['eot', 'woff', 'woff2', 'ttf', 'otf'],
        },
      ],
    };

    this.openFileDialog(options).then(
      (filePath) => {
        const fileBuffer = this.electronService.fs.readFileSync(filePath);
        const fileName = basename(filePath);

        this.fontService.loadNewFont(
          fileBuffer.buffer, fileName).then((res) => {

            const currFonts = this.loadedFonts.value;

            // Läd im Html die neue schriftart zur auswahl hinzu
            currFonts.push({ name: fileName, data: fileBuffer });

            this.loadedFonts.next(currFonts);

            this.setFontFamily(fileName);

          });

      }
    );

  }

  /**
   * Läd und fügt die Serialisierten Schriftarten hinzu
   * @param fonts Template Schriftarten
   */
  async loadRegisterFont(fonts: ILoadedFont[]): Promise<any> {

    const res = await this.fontService.loadTemplateFonts(fonts);
    this.loadedFonts.next(fonts);
  }


  /**
   * Vereinfacht die Öffnen-Dialog Initialisierung
   * @param options die Electron-Dialog Einstellungen
   * 
   * @returns Promise mit Erstem ausgewähltem Pfad
   */
  openFileDialog(options: Electron.OpenDialogOptions): Promise<string> {

    return new Promise<string>(async (resolve, reject) => {
      await this.electronService.remote.dialog.showOpenDialog(options,
        (filePaths) => {
          if (filePaths === undefined) {
            reject();
          } else {
            resolve(filePaths[0]);
          }
        });
    });
  }

  /**
   * Vereinfacht die Speichern-Dialog Initialisierung
   * @param options die Electron-Dialog Einstellungen
   * 
   * @returns Promise mit dem ausgewähltem Pfad
   */
  saveFileDialog(options: Electron.SaveDialogOptions): Promise<string> {

    return new Promise<string>(async (resolve, reject) => {
      await this.electronService.remote.dialog.showSaveDialog(null, options,
        (filePath) => {
          if (filePath === undefined) {
            reject();
          } else {
            resolve(filePath);
          }
        });
    });
  }

  //#endregion IO Operations
}

