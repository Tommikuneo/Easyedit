import { fabric } from 'fabric';

export class EImage extends fabric.Image {

  public id: number;
  public isPlaceholder = false;

  // Fügt neue zu Serialisierende Attribute hinzu
  public toObject() {
    return super.toObject(['id', 'isPlaceholder', 'lockMovementX', 'lockMovementY', 'hasControls']);
  }
}
