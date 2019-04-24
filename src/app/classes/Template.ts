import { QueueManager } from './QueueManager';
import { TemplateDto } from '../dto/Template.dto';
import { ILoadedFont } from '../interfaces/ILoadedFont';


/**
 * Verwaltet die zu Serialisierenden Daten
 */
export class Template {
  canvas: any;
  workspace = '';
  queueManager: QueueManager;
  fonts: ILoadedFont[];

  /**
   * Läd Template von Serialisiertem
   * @param dto serialisiertes template
   */
  static fromDto(dto: TemplateDto) {
    const template = new this();
    template.queueManager = QueueManager.fromDto(dto.queueManager);
    template.canvas = dto.canvas;
    template.fonts = (dto.fonts) ? dto.fonts : [] ;
    template.fonts.forEach(f => f.data = Buffer.from(f.data));
    return template;
}

/**
 *
 * @param canvas Serialisiertes Canvas
 * @param queueManager
 * @param fonts
 */
  static create(canvas: string, queueManager: QueueManager, fonts: ILoadedFont[] = [] ) {
    const template = new this();
    template.queueManager = queueManager;
    template.canvas = canvas;
    template.fonts = fonts;
    return template;
  }

  /**
   * Ertstellt Serialisierbares Objekt
   */
  toDto(): TemplateDto {
    const dto = new TemplateDto();
    dto.canvas = this.canvas;
    dto.queueManager = this.queueManager.toDto();
    dto.fonts = this.fonts;
    return dto;
  }

}
