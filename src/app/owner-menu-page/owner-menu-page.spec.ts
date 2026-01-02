import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerMenuPage } from './owner-menu-page';

describe('OwnerMenuPage', () => {
  let component: OwnerMenuPage;
  let fixture: ComponentFixture<OwnerMenuPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerMenuPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerMenuPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
