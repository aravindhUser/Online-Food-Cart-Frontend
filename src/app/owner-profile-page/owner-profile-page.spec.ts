import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerProfilePage } from './owner-profile-page';

describe('OwnerProfilePage', () => {
  let component: OwnerProfilePage;
  let fixture: ComponentFixture<OwnerProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerProfilePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
