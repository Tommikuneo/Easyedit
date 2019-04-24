import { fabric } from 'fabric';

export class EText extends fabric.IText {

  public id: number;

  public maxChars: number;

  // Fügt neue zu Serialisierende Attribute hinzu
  public toObject() {
    return super.toObject(['id', 'lockMovementX', 'lockMovementY', 'hasControls', 'maxChars']);
  }


}
