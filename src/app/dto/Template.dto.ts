import { QueueManagerDto } from "./QueueManager.dto";
import { ILoadedFont } from "../interfaces/ILoadedFont";

export class TemplateDto {
  canvas: string;
  queueManager: QueueManagerDto;
  fonts: ILoadedFont[];
}
