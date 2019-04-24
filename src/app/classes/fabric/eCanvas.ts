import { fabric } from 'fabric';
import { QueueManager } from '../QueueManager';

export class ECanvas extends fabric.Canvas {

  public height: 400;
  public projectName: { vendor: string, name: string };
  public queueManager = new QueueManager();

  public cleanSelect() {
    this.discardActiveObject().renderAll();
  }

  public selectItem(obj: fabric.Object) {
    this.discardActiveObject().renderAll();
    this.setActiveObject(obj);
  }



  public bringActiveToFront() {
    const activeObject = this.getActiveObject(),
      activeGroup = this.getActiveObjects();

    if (activeObject) {
      activeObject.bringForward();
    } else if (activeGroup) {
      const objectsInGroup = activeGroup;
      this.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.bringForward();
      });
    }
  }

  public sendActiveToBack() {
    const activeObject = this.getActiveObject(),
      activeGroup = this.getActiveObjects();

    if (activeObject) {

      activeObject.sendBackwards();

    } else if (activeGroup) {
      const objectsInGroup = activeGroup;
      this.discardActiveGroup();
      objectsInGroup.forEach((object) => {
        object.sendBackwards();
      });
    }
  }

  /**
   * Wiederherstellt vorherigen stand aus dem Queuemanager
   */
  public restorePrevious() {
    const previous = this.queueManager.getPrevious();
    if (previous) {
      this.clear();
      this.loadFromJSON(previous, () => this.renderAll);
    }
  }

  /**
   * Wiederherstellt nächsten stand aus dem Queuemanager
   */
  public restoreNext() {
    const next = this.queueManager.getNext();
    if (next) {
      this.clear();
      this.loadFromJSON(next, () => this.renderAll);
    }
  }


}
