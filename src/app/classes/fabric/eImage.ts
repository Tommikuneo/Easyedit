import { fabric } from 'fabric';

export class EImage extends fabric.Image {

  public id: number;
  public isPlaceholder = false;

  stateProperties =  (
    'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
    'stroke strokeWidth strokeDashArray strokeLineCap strokeLineJoin strokeMiterLimit ' +
    'angle opacity fill fillRule globalCompositeOperation shadow clipTo visible backgroundColor ' +
    'alignX alignY meetOrSlice skewX skewY selectable lockMovementX lockMovementY ' +
    'lockScalingX lockScalingY lockUniScaling lockRotation hasControls id isPlaceholder'
  ).split(' ');

  // Fügt neue zu Serialisierende Attribute hinzu
  public toObject() {
    return super.toObject(['id', 'isPlaceholder', 'lockMovementX', 'lockMovementY', 'hasControls']);
  }
}
