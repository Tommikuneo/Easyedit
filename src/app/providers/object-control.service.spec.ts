import { TestBed } from '@angular/core/testing';

import { ObjectControlService } from './object-control.service';

describe('ObjectControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectControlService = TestBed.get(ObjectControlService);
    expect(service).toBeTruthy();
  });
});
