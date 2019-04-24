import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { remote } from 'electron';
import { Canvas } from 'fabric/fabric-impl';
import { ToastrService } from 'ngx-toastr';
import { ECanvas } from '../../classes/fabric/eCanvas';
import { ICanvas } from '../../interfaces/ICanvas';
import { ElectronService } from '../../providers/electron.service';
import { FabricEditorService } from '../../providers/fabric.editor.service';
import { PublishAssistentService } from '../../providers/publish-assistent.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  public canvas: ECanvas;
  public aElement: fabric.Object;
  public size: { width: number, height: number } = {
    width: 1200,
    height: 630
  };
  public activeFile: string;
  imagePresent: HTMLImageElement;
  public ctx: CanvasRenderingContext2D;
  addFont = require('add-font');
  FontFaceObserver = require('fontfaceobserver');
  fabricCanvas: Canvas;
  menu: any;
  tuiDiv: any;
  mainCanvas: any;

  constructor(
    public electronService: ElectronService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private toastr: ToastrService,
    public faService: FabricEditorService,
    public publishAssistentService: PublishAssistentService,
  ) {

    this.buildMenu();

  }

  ngOnInit() {

    this.createCanvas();

    /**
     * Prüft ob die Seite mit einem Template initialisiert werden soll
     * und läd diesen.
    */
    this.route.paramMap.subscribe(
      (async params => {

        if (params.get('filePath')) {
          this.activeFile = params.get('filePath');
          const canvasData: ICanvas = await this.faService.loadCanvasFromTemplate(this.activeFile, this.canvas);
          this.size.width = canvasData.width;
          this.size.height = canvasData.height;

        } else {

          this.canvas.setWidth(this.size.width);
          this.canvas.setHeight(this.size.height);
        }

      })
    );
  }

  /**
   * 
   * Erstellt die Navigationsleiste
   */
  private buildMenu() {

    this.menu = remote.Menu.buildFromTemplate([
      {
        label: 'Navigation',
        submenu: [{
          label: 'Editor',
          click: () => this.ngZone.run(() => this.router.navigateByUrl(''))
        }, {
          label: 'Template Designer',
          click: () => this.ngZone.run(() => this.router.navigateByUrl('/designer'))
        },
        ]
      },
      {
        label: 'Datei',
        submenu: [{
          label: 'Öffne Template',
          click: () => this.loadCanvasFromJSON()
        }, {
          label: 'Als Bild Exportieren',
          click: () => this.faService.saveCanvasToImage()
        }
          , {
          label: 'Template Exportieren',
          click: () => this.faService.saveCanvasToJSON(this.canvas)
        },
        {
          label: 'Arbeitsfläche leeren',
          click: () => this.confirmClear(),
        }
        ]
      },
      {
        label: 'Editieren',
        submenu: [{
          label: 'Rückgängig',
          accelerator: 'CommandOrControl+Z',
          click: () => this.faService.restorePrevious(),
        }, {
          label: 'Wiederholen',
          accelerator: 'CommandOrControl+Y',
          click: () => this.faService.restoreNext(),
        }
        ]
      },
      {
        label: 'Veröffentlichen',
        submenu: [{
          label: 'API-Key hinzufügen',
          click: () => {
            this.publishAssistentService.openApiInputDialog();
          },
        }, {
          label: 'Veröffentlichungsassistent',
          click: () => {
            if (this.canvas.projectName && this.canvas.projectName.name && this.canvas.projectName.vendor) {
              this.publishAssistentService.openPublishDialog(this.canvas);
            } else {
              this.toastr.error('Bitte geben Sie ein Template mit Projektnamen ein');
            }
          },
        }
        ]
      }
    ]);

    remote.Menu.setApplicationMenu(this.menu);

  }

  /**
   * Initialisiert die Arbeitsfläche und gibt diese 
   * zur verwaltung an den Service weiter
   */
  createCanvas(): any {
    // setup front side canvas

    this.canvas = new ECanvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      backgroundColor: '#ffffff',
    });


    this.faService.initializeCanvas(this.canvas);
    this.faService.activeObservable.subscribe(e => this.aElement = e);
  }


  confirmClear() {
    if (confirm('Sind Sie sicher?')) {
      this.canvas.clear();
      this.activeFile = null;

    }
  }

  loadCanvasFromJSON() {
    this.faService.loadCanvasFromJSON(this.canvas).then(
      (file) => this.activeFile = file.filePath
    );
  }


}
