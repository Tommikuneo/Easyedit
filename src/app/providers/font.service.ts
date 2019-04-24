import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ILoadedFont } from '../interfaces/ILoadedFont';

@Injectable()
export class FontService {
  private addFont = require('add-font');
  private FontFaceObserver = require('fontfaceobserver');
  constructor(
    public electronService: ElectronService,
  ) { }

  /**
   * 
   * @param tFont die im Template serialisierte Schriftart
   * 
   * @returns Ein Promise mit Erfolgsmeldung
   */
  public loadTemplateFont(tFont: ILoadedFont): Promise<any> {

    this.addFont(tFont.data.buffer, tFont.name);
    const font = new this.FontFaceObserver(name);
    return font.load();
  }

  public loadTemplateFonts(tfonts: ILoadedFont[]): Promise<any> {

    const observers = [];

    for (const tfont of tfonts) {

      this.addFont(tfont.data.buffer, tfont.name);
      const oberver = new this.FontFaceObserver(tfont.name);
      observers.push(oberver.load());
    }

    return Promise.all(observers);

  }

  /**
   *
   * @param buffer buffer der Font-Datei
   * @param name Name der Schriftart
   *
   * @returns Ein Promise mit Erfolgsmeldung
   */
  public loadNewFont(buffer: ArrayBuffer, name: string): Promise<any> {

    this.addFont(buffer, name);
    const font = new this.FontFaceObserver(name);
    return font.load();
  }

  public loadFonts(fonts: [{ buffer: ArrayBuffer, name: string }]): Promise<any> {

    const observers = [];

    for (const font of fonts) {
      this.addFont(font.buffer, font.name);
      const oberver = new this.FontFaceObserver(font.name);
      observers.push(oberver.load());
    }

    return Promise.all(observers);

  }

}
