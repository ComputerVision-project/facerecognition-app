import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModesPage } from './modes.page';

describe('ModesPage', () => {
  let component: ModesPage;
  let fixture: ComponentFixture<ModesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ModesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
