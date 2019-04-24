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
  ) { }


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

  restorePrevious = () => this.canvas.restorePrevious();

  restoreNext = () => this.canvas.restoreNext();


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

