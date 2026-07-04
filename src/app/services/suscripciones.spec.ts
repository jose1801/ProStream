import { TestBed } from '@angular/core/testing';

import { Suscripciones } from './suscripciones';

describe('Suscripciones', () => {
  let service: Suscripciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Suscripciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
