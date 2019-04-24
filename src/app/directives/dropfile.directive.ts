import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[app-dropfile]',
})
export class DropfileDirective {

  @Output() dropped =  new EventEmitter<FileList>();

  @HostListener('drop', ['$event'])
   public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.dropped.emit(files);
    }
}
 }
