const Twit = require('twit');
import { IPublishPlatform } from '../../interfaces/IPublishPlatform';
import { ITwitterOptions } from '../../interfaces/publish/ItwitterOptions';
export class Twitter implements IPublishPlatform {
  private twitter;

  constructor(twitOptions: ITwitterOptions) {
    this.twitter = new Twit(twitOptions);
  }

  async PostText(text: string) {
    try {
      const tweet = await this.twitter.post('statuses/update', text);
      return tweet;

    } catch (err) {
      console.log(err);

    }
  }

  async PostImage(image: any, text: any) {

    try {
      // Läd bild hoch
      const media = await this.twitter.post('media/upload', { media_data: image });

      // Erstellt ein Twitter Status opjekt
      const status = {
        status: text ? text : null,
        media_ids: [media.data.media_id_string] // Die ID des Hochgeladenen Fotos
      };

      try {
        // Veröffentlicht den Post
        const tweet = await this.twitter.post('statuses/update', status);
        console.log(tweet.data.entities.media[0].media_url_https);
        return tweet.data.entities.media[0].media_url_https;

      } catch (err) {
        console.log(err);

      }

    } catch (err) {
      console.log(err);
    }
  }

}
