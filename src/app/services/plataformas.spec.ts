import { TestBed } from '@angular/core/testing';

import { Plataformas } from './plataformas';

describe('Plataformas', () => {
  let service: Plataformas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Plataformas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
