import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TakephotoPage } from './takephoto.page';

describe('TakephotoPage', () => {
  let component: TakephotoPage;
  let fixture: ComponentFixture<TakephotoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TakephotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
