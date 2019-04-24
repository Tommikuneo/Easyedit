import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { isEqual } from 'lodash';

@Injectable()
export class StorageService {
  constructor(
    public electronService: ElectronService,
  ) { }

/**
 * Persistiert einen Wert und gibt bei erfolg true zurück
 * @param key (string oder nested array string )
 * @param value die zu speichernden Daten
 * @returns boolean für den Erflog
 */
  setValue( key: string, value: any ): boolean {
    this.electronService.eStore.set(key, value);
    const val = this.getValue(key);
    return isEqual(value, val);
  }

  /**
   * Gibt den Wert des keys zurück
   * @param key (string oder nested array string )
   */
  getValue(key: string ) {
    return this.electronService.eStore.get(key, true);
  }

}
