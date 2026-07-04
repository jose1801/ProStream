import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditoriaPage } from './auditoria.page';

describe('AuditoriaPage', () => {
  let component: AuditoriaPage;
  let fixture: ComponentFixture<AuditoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
