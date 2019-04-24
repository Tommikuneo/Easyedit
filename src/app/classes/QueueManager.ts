import { QueueManagerDto } from '../dto/QueueManager.dto';

export class QueueManager {
  private _states: string[];
  private _pos: number;
  private _maxCache: number;

  static fromDto(data: QueueManagerDto) {
    return new this(data._maxCache, data._states, data._pos);
}

  constructor(maxCache = 50, states: string[] = [], pos: number = -1) {
    this._maxCache = maxCache;
    this._states = states;
    this._pos = pos;
  }

  public get state(): string {
    return this._states[this._pos];
  }

  public set state(v: string) {
    if ( this._states.length <= this._maxCache ) {
      this._states.push(v);
      this._pos++;
    } else {
      this._states.shift();
      this._states.push(v);
    }
  }

  public getPrevious() {

    if (this._pos >= 1 && this._pos <= this._states.length - 1) {
      this._pos--;
      return this._states[this._pos];
    }
  }

  public getNext() {
    if (this._pos <= this._maxCache &&  this._pos < this._states.length - 1) {
      this._pos++;
      return this._states[this._pos];
    }
  }


  public toDto (): QueueManagerDto {
    const dto = new QueueManagerDto();
    const states = this._states.slice(- 5);
    dto._maxCache = this._maxCache;
    dto._pos = states.length - 1;
    dto._states = states;
    return dto;
  }

}
