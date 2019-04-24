

import { BrowserWindow, session } from 'electron';
import { IPublishPlatform } from '../../interfaces/IPublishPlatform';
import { readFileSync } from 'fs';
import { ITwitterOptions } from '../../interfaces/publish/ItwitterOptions';

export class Instagram implements IPublishPlatform {
  private instagram;

  constructor() {


  }

  PostText(text: string) {
    throw new Error("Method not implemented.");
  }

  PostImage(image: any, text: any) {
    throw new Error("Method not implemented.");
  }



}
