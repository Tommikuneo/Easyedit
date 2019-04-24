import { Component, OnInit, NgZone } from '@angular/core';
import { URL } from 'url';
import { Canvas } from 'fabric/fabric-impl';
import { fabric } from 'fabric';
import { ElectronService } from '../../providers/electron.service';
import { FontService } from '../../providers/font.service';
import { EText } from '../../classes/fabric/eText';
import { ECanvas } from '../../classes/fabric/eCanvas';
import { remote, Menu } from 'electron';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ICanvas } from '../../interfaces/ICanvas';
import { ToastrService } from 'ngx-toastr';
import { FabricDesignerService } from '../../providers/fabric.designer.service';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { PublishAssistentService } from '../../providers/publish-assistent.service';


@Component({
  selector: 'app-template-designer',
  templateUrl: './template-designer.component.html',
  styleUrls: ['./template-designer.component.scss']
})

export class TemplateDesignerComponent implements OnInit {

  public canvas: ECanvas;
  public aElement: fabric.Object;
  public props = {
    canvasFill: '#ffffff',
    canvasImage: '',
  };

  private sampleFonts = [ 'Arial', 'Helvetica', 'Verdana', 'Roboto', 'Raleway' ];
  public fonts = this.sampleFonts;

  public textString: string;
  public url = '';
  public projectName: {vendor: string, name: string} = {
    vendor: '',
    name: '',
  };
  public size: {width: number, height: number} = {
    width: 1200,
    height: 630
  };

  public json = '';
  public globalEditor = false;
  public textEditor = false;
  public imageEditor = false;
  public figureEditor = false;
  public selected: any;
  private menu: Electron.Menu;
  public activeFile: string;

  constructor(
    public electronService: ElectronService,
    public publishAssistentService: PublishAssistentService,
    public faService: FabricDesignerService,
    private fontService: FontService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {

    //  this.menu.append(new this.electronService.remote.MenuItem({ label: 'Back', click: () => alert('hi')  }));


    /*this._hotkeysService.add(
      [
        new Hotkey('ctrl+s', (event: KeyboardEvent): boolean => {
        this.faService.saveOverrideCanvasToJSON(this.canvas, this.activeFile);
        return false; // Prevent bubbling
      }
      )
      , new Hotkey('ctrl+z', (event: KeyboardEvent): boolean => {
        const previous = this.faService.queueManager.getPrevious();
        if (previous) {
        this.canvas.clear();
        this.canvas.loadFromJSON(previous, () => this.canvas.renderAll );
        } else {
          console.log('no Previous');
        }
        return false; // Prevent bubbling
      }),
      new Hotkey('ctrl+y', (event: KeyboardEvent): boolean => {
        const next = this.faService.queueManager.getNext();
        if (next) {
        this.canvas.clear();
        this.canvas.loadFromJSON(next, () => this.canvas.renderAll );
        } else {
          console.log('no Next');
        }
        return false; // Prevent bubbling
      }),
    ]);
    */
  }

  ngOnInit() {

    this.buildMenu();

    this.createCanvas();

    this.route.paramMap.subscribe(
      (async params => {

        if (params.get('filePath')) {
          this.activeFile = params.get('filePath');
          const canvasData: ICanvas = await this.faService.loadCanvasFromTemplate(this.activeFile, this.canvas );
          this.size.width = canvasData.width;
          this.size.height = canvasData.height;
          this.projectName = canvasData.projectName;

        } else {

          this.canvas.setWidth(this.size.width);
          this.canvas.setHeight(this.size.height);
        }

      })
    );



    // get references to the html canvas element & its context
    // this.canvas.on('mouse:down', (e) => {
    // let canvasElement: any = document.getElementById('canvas');
    // console.log(canvasElement)
    // });

  }
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
    this.faService.activeObservable.subscribe( e => this.aElement = e);
    this.faService.loadedFonts
      .pipe(map( fonts  => fonts.map( f => f.name ) )  )
      .subscribe(( font => this.fonts = this.sampleFonts.concat(font).sort()) );
  }



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
        }, {
          label: 'Template speichern',
          accelerator: 'CommandOrControl+S',
          click: () => this.faService.saveOverrideCanvasToJSON(this.canvas, this.activeFile)
        },
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
          click: ()  => this.faService.restoreNext(),
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
            if (this.projectName.name && this.projectName.vendor) {
            this.publishAssistentService.openPublishDialog(this.canvas);
            } else {
              this.toastr.error('Bitte geben Sie einen Projektnamen ein');
            }
          },
        }
        ]
      }
    ]);

    remote.Menu.setApplicationMenu(this.menu);

  }


  /*------------------------Block elements------------------------*/

  // Block "Projectname"

  changeProjectName(event: any) {
    if ( this.projectName.vendor && this.projectName.name ) {
      this.canvas.projectName = this.projectName;
    } else {
      this.canvas.projectName =  {
        vendor: '',
        name: '',
    };
  }

  }

  // Block "Size"

  changeSize(event: any) {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }



  // Block "Add text"

  addText() {
    this.faService.addText(this.textString);
    this.textString = '';
  }

  // Block "Upload Image"

  readUrl(event) {
    this.faService.readUrl(event).onload = (ev) => {
      this.url = ev.target['result'];
      this.faService.addImageOnCanvas(ev.target['result']);
    };
  }


  removeWhite(url) {
    this.url = '';
    const fileInput = document.getElementById('testImageInput') as HTMLInputElement;
    fileInput.value = '';

  }

  canvasFileDrop(event: FileList) {
    const file = event.item(0);

    if (file.path.endsWith('.ee')) {
      this.electronService.showViewChooser(file.path);
    } else {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => this.faService.addImageOnCanvas(ev.target['result']);
      } catch (error) {
        this.toastr.error('The file is not supported');
      }

    }
  }


  /*Canvas*/

  setCanvasImage() {
    if (this.props.canvasImage) { this.faService.setCanvasImage(this.props.canvasImage); }
  }


  /*System*/

/*
  addNewFont() {

    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [
        { name: 'Font',
         extensions: ['otf'],
        }
      ],
    };

    this.electronService.remote.dialog.showOpenDialog(options ,
      (filePaths) => {
      if (filePaths === undefined) {
        return;
      }

      const filePath = filePaths[0];
      const prefix = (this.electronService.platform === 'win32') ? 'file' : 'smb';
      let URI = new URL(`${prefix}:///${filePath}`).toString();

      URI = URI.replace('///', '/////');

      this.fontService.loadFont(
        URI , 'TEST').then( (res) =>  {
        console.log(res);
      });


  });


}
*/

  confirmClear() {
    if (confirm('Are you sure?')) {
      this.canvas.clear();
      this.activeFile = null;
      this.projectName = {
        vendor: '',
        name: '',
      };
    }
  }

  loadCanvasFromJSON() {
    this.faService.loadCanvasFromJSON(this.canvas).then(
      (file) => {
        this.activeFile = file.filePath;

      this.size.width = file.canvas.width;
      this.size.height = file.canvas.height;
      if (file.canvas.projectName) {this.projectName = file.canvas.projectName };
      }
      );
    }

  rasterizeJSON = () => this.json = JSON.stringify(this.canvas, null, 2);

}
