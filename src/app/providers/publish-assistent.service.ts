import { Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ECanvas } from '../classes/fabric/eCanvas';
import { PublishAssistentComponent } from '../dialogs/publish-assistent/publish-assistent.component';
import { ApiKeyInputDialogComponent } from '../dialogs/api-key-input-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PublishAssistentService {

  constructor(
    public dialog: MatDialog,
    private ngZone: NgZone,
  ) { }


  openPublishDialog(canvas: ECanvas) {
    this.ngZone.run(() => {
    const dialogRef = this.dialog.open(PublishAssistentComponent, {
      minWidth: '50%',
      data: {canvas: canvas}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  });
  }

  openApiInputDialog() {

    // Setzt den Scope zu Angular
    this.ngZone.run(() => {
    const dialogRef = this.dialog.open(ApiKeyInputDialogComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  });
  }
}
