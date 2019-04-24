import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../providers/storage.service';


@Component({
  selector: 'app-key-input-dialog',
  template: `<h1 mat-dialog-title>Wie wollen Sie die Datei bearbeiten?</h1>
  <div mat-dialog-content #dialogContent>
  <div class="form">
  <form [formGroup]="platformGroup">

  <div class="row">
    <div class="col">
      <mat-form-field>
        <input matInput formControlName="projectname" placeholder="Projektbezeichnung">
      </mat-form-field>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <mat-form-field>
        <mat-label>Wähle eine Plattform</mat-label>
        <mat-select formControlName="platform" reqired>
          <mat-option value="twitter">Twitter</mat-option>
          <mat-option value="facebook">Facebook</mat-option>
          <mat-option value="instagram">Instagram</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  </div>
  <div formGroupName="twitter" *ngIf="platformGroup.get('platform').value === 'twitter'">
    <div class="row">
      <div class="col">
          <mat-form-field>
              <input matInput formControlName="consumer_key" placeholder="consumer key">
            </mat-form-field>
      </div>
      <div class="col">
          <mat-form-field>
              <input matInput formControlName="consumer_secret" placeholder="consumer secret">
            </mat-form-field>
      </div>
    </div>
    <div class="row">
      <div class="col">
          <mat-form-field>
              <input matInput formControlName="access_token" placeholder="access token">
            </mat-form-field>
      </div>
      <div class="col">
          <mat-form-field>
              <input matInput formControlName="access_token_secret" placeholder="access token secret">
            </mat-form-field>
      </div>
    </div>
  </div>
  <div class="row" formGroupName="facebook" *ngIf="platformGroup.get('platform').value === 'facebook'">
    <div class="col" >
      <mat-form-field>
        <input matInput formControlName="siteToken" placeholder="SiteToken">
      </mat-form-field>
    </div>

  </div>

</form>

  </div>
  <div class="row">
  <div class="col-sm">
  <button mat-stroked-button (click)="closeDialog('lol')">Abbrechen</button>
  </div>
  <div class="col-sm">
  <button mat-stroked-button type="submit" (click)="closeDialog('save')">Speichern</button>
  </div>
  </div>
  </div>
  `,
  styles: [`
  button { width: 100% }
  #canvas { width: 100%; height: 100%; }
  `]
})
export class ApiKeyInputDialogComponent {
  @ViewChild('dialogContent') modalContent: ElementRef<HTMLDivElement>;
  public platformGroup: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ApiKeyInputDialogComponent>,
    private storeService: StorageService,
    protected toastr: ToastrService,
    fb: FormBuilder

  ) {
    // Erstellt die Reactive forms von Angular
    this.platformGroup = fb.group({
      projectname: ['', Validators.required],
      platform: ['', Validators.required],
      twitter: fb.group({
        consumer_key: ['', Validators.required],
        consumer_secret: ['', Validators.required],
        access_token: ['', Validators.required],
        access_token_secret: ['', Validators.required],
      }),
      facebook: fb.group({
        siteToken: ['', Validators.required],
      }),
    });
  }

  closeDialog(action: string) {

    if (action === 'save') {

      const values = this.platformGroup.value;
      this.validateAllFormFields(this.platformGroup);

      if (values.platform && values.projectname) {
        this.saveAPIKey(values);
      }

    } else {
      this.dialogRef.close();
    }

  }


  /**
   * Speichert die Eingegebenen Keys in den Speicher
   * @param values die Werte der Formularfelder
   */
  private saveAPIKey(values: any) {

    if (this.platformGroup.get(values.platform).valid) {
      const res = this.storeService.setValue(values.projectname + `.${values.platform}`, values.twitter);
      if (res === true) {
        this.toastr.success('Der API-Schlüssel wurde gespeichert');
        this.dialogRef.close();
      } else {
        this.toastr.error('Fehler beim schreiben');
      }

    } else {
      console.log('not valid');

    }

  }


  /**
   * Validiert Rekursiv alle Formularfelder
   * @param formGroup die zu valisierende Formgroup
   */
  private validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}
