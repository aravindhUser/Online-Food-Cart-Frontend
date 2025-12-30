import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPageOwner } from './registration-page-owner';

describe('RegistrationPageOwner', () => {
  let component: RegistrationPageOwner;
  let fixture: ComponentFixture<RegistrationPageOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPageOwner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationPageOwner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
