import * as FB from 'fb';
import { BrowserWindow, session, ipcRenderer } from 'electron';
import { IPublishPlatform } from '../../interfaces/IPublishPlatform';

export class Facebook implements IPublishPlatform {
  private appId = '6546546464654567';
  private appSecret: 'ad757e4752f403blkke3c15f8i35244a';
  fb = new FB.Facebook({
    version: 'v3.2',
    appId: this.appId,
    appSecret: this.appSecret,
  });
  constructor() {

  }

  getPosts(token: string) {
    this.fb.setAccessToken(token);
    this.fb.api('me', { fields: ['id', 'name'] }, function (res) {
      if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }
    });
  }

  /**
   * Inistalisiert die Nutzer Authentifizierung 
   * Kommuniziert mit dem main Prozess
   * 
   * @returns Den Token sobald die Authentifizierzung vollendet ist
   */
  authenticateMain() {

    const facebookAuthURL = this.getLoginUrl();

    return new Promise((resolve, reject) => {
      // 2. Reagiert auf Antwort des Main Prozesses
      ipcRenderer.once('fb-authenticated', async (event, code) => {
      const aToken = await this.getToken(code);
        resolve(aToken);
    });

    // 1. Sendet Anfrage zum Fenster Erstellen an den Main-Prozess
    ipcRenderer.send('fb-authenticate', facebookAuthURL);

    });


  }

  getLoginUrl() {
    const url = this.fb.getLoginUrl({
      appId: this.appId,
      fields: 'id,name',
      scope: 'user_posts,manage_pages,publish_pages,user_photos',
      redirect_uri: 'https://www.facebook.com/connect/login_success.html'
    });
    return url;
  }


  /**
   * Fragt per authentifizierungscode einen validen Token ab
   * @param code Der Vorläufige facebook url token
   * 
   * @returns Promise mit Api Token
   */
  async getToken(code: string): Promise<string> {

    const res = await this.fb.api('oauth/access_token', {
      redirect_uri: 'https://www.facebook.com/connect/login_success.html',
      code: code,
    });

    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    this.fb.setAccessToken(res.access_token);
    this.getPageToken();
    return res.access_token;
  }

  async getPageToken() {
    const res = await this.fb.api('me/accounts', 'get');
    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    this.fb.setAccessToken(res.data[0].access_token);
  }

  async PostText(text: string) {
    const res = await this.fb.api('me/feed', 'post', { message: text });
    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log('Post Id: ' + res.id);
  }

  async PostImage(image: any, text: any) {
    const res = await this.fb.api('me/photos/', 'post',
    { caption: '',
    }
    );
    if (!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
    }
    console.log('Post Id: ' + res.id);
  }
}
