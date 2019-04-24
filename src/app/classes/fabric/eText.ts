import { fabric } from 'fabric';

export class EText extends fabric.IText {

  public id: number;

  public maxChars: number;

  stateProperties =  (
    'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
    'stroke strokeWidth strokeDashArray strokeLineCap strokeLineJoin strokeMiterLimit ' +
    'angle opacity fill fillRule globalCompositeOperation shadow clipTo visible backgroundColor ' +
    'alignX alignY meetOrSlice skewX skewY selectable lockMovementX lockMovementY lockScalingX lockScalingY lockUniScaling lockRotation id'
  ).split(' ');

  // Fügt neue zu Serialisierende Attribute hinzu
  public toObject() {
    return super.toObject(['id', 'lockMovementX', 'lockMovementY', 'hasControls', 'maxChars']);
  }


}
