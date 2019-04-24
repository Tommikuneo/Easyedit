import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fabric } from 'fabric';
import { Template } from '../classes/Template';
import { TemplateDto } from '../dto/Template.dto';
import { ICanvas } from '../interfaces/ICanvas';

@Component({
  selector: 'app-view-chooser-dialog',
  template: `<h1 mat-dialog-title>Wie wollen Sie die Datei bearbeiten?</h1>
  <div mat-dialog-content #dialogContent>
  <div class="canvas">
  <canvas id="canvas"></canvas>
  </div>
  <div class="row">
  <div class="col-sm">
  <button mat-stroked-button (click)="closeDialog('editor')">Editor</button>
  </div>
  <div class="col-sm">
  <button mat-stroked-button (click)="closeDialog('designer')">Designer</button>
  </div>
  </div>
  </div>
  `,
  styles: [`
  button { width: 100% }
  #canvas { width: 100%; height: 100%; }
  `]
})
export class ViewChooserDialogComponent implements OnInit {
  @ViewChild('dialogContent') modalContent: ElementRef<HTMLDivElement>;

  constructor(
    public dialogRef: MatDialogRef<ViewChooserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { json: string, action: string },

  ) { }

  closeDialog(action: string) {
    this.data.action = action;
    this.dialogRef.close(this.data);
  }

  // Öffnet das übergebene Template und rendert es Statisch auf der Seite
  ngOnInit() {

    const canvas = new fabric.StaticCanvas('canvas');
    const dto: TemplateDto = JSON.parse(this.data.json);
    const template: Template = Template.fromDto(dto);
    const can: ICanvas = template.canvas;

    canvas.loadFromJSON(template.canvas, () => {
      canvas.setWidth(can.width);
      console.log(can);

      canvas.setHeight(can.height);
      canvas.renderAll();

      const currH = canvas.getHeight(),
        currW = canvas.getWidth(),
        diaH = this.modalContent.nativeElement.clientHeight,
        dieW = this.modalContent.nativeElement.clientWidth,
        scaleRatio = Math.min(dieW / currW, diaH / currH);
      canvas.setDimensions({ width: canvas.getWidth() * scaleRatio, height: canvas.getHeight() * scaleRatio });
      console.log(scaleRatio);
      canvas.setZoom(scaleRatio);
    });
  }

}
