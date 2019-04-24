import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { ECanvas } from '../../classes/fabric/eCanvas';
import { Facebook } from '../../classes/publish/facebook';
import { Twitter } from '../../classes/publish/twitter';
import { ElectronService } from '../../providers/electron.service';
import { PublishService } from '../../providers/publish.service';
import { StorageService } from '../../providers/storage.service';

@Component({
  selector: 'app-publish-assistent',
  templateUrl: './publish-assistent.component.html',
  styleUrls: ['./publish-assistent.component.scss']
})
export class PublishAssistentComponent implements OnInit {
  @ViewChild('publishDialogContent') modalContent: ElementRef<HTMLDivElement>;
  imgSrc: string;
  imageText: string;
  image: string;
  step = 0;

  platforms = {
    twitter: { available: false, selected: false, key: null },
    facebook: { available: false, selected: false, key: null },
    instagram: { available: false, selected: false, key: null },
  };

  publishResult: string;

  constructor(
    public dialogRef: MatDialogRef<PublishAssistentComponent>,
    private storeService: StorageService,
    protected toastr: ToastrService,
    public electronService: ElectronService,
    @Inject(MAT_DIALOG_DATA) public data: { canvas: ECanvas },
  ) {
    this.loadAPIkonfigurations();
  }

  ngOnInit() {
    const canvas = this.data.canvas.toDataURL({ format: 'png', multiplier: 2 });
    this.imgSrc = canvas;
    this.image = canvas.replace(/^data:image\/png;base64,/, '');

  }




  // Stepper funktionalität
  previousStep = () => this.step--;
  nextStep = () => this.step++;

  /**
   * Läd die Konfigurationen und macht die Checkboxen auswählbar falls vorhanden
   */
  private loadAPIkonfigurations() {
    const pData = this.storeService.getValue(`${this.data.canvas.projectName.vendor}.${this.data.canvas.projectName.name}`) as Object;

    Object.keys(pData).forEach(platform => {
      const key = pData[platform];

      switch (platform) {
        case 'twitter':
          this.platforms.twitter.available = true;
          this.platforms.twitter.key = key;
          break;

        case 'facebook':
          this.platforms.facebook.available = true;
          this.platforms.facebook.key = key;
          break;

        case 'instagram':
          this.platforms.instagram.available = true;
          this.platforms.facebook.key = key;
          break;

        default:
          break;
      }

    });
  }


  close() {
    this.dialogRef.close();
  }


  async publish() {
    const toPublish = Object.keys(this.platforms).filter(p => this.platforms[p].selected === true);
    console.log(toPublish);
    for (const platform of toPublish) {

      switch (platform) {
        case 'twitter':
          const twitter = new Twitter(this.platforms[platform].key);
          const twitterRes = twitter.PostImage(this.image, this.imageText);

          if (twitterRes) {
            this.toastr.success('Post erfolgreich veröffentlicht');
          } else {
            this.toastr.error('Etwas ist schiefgelaufen');
          }

          break;

        case 'facebook':

          const fb = new Facebook();
          await fb.fb.setAccessToken(this.platforms[platform].key.siteToken);
          try {
            await fb.PostText(this.imageText);
          } catch (error) {
            await fb.authenticateMain();
          }
          try {
            await fb.PostText(this.imageText);
            this.toastr.success('Post erfolgreich veröffentlicht');
          } catch (error) {
            this.toastr.error('Etwas ist schiefgelaufen');
          }
          break;

        case 'instagram':


          break;

        default:
          break;
      }

    }
  }




}
