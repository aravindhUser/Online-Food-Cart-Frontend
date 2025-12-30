import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPageUser } from './registration-page-user';

describe('RegistrationPageUser', () => {
  let component: RegistrationPageUser;
  let fixture: ComponentFixture<RegistrationPageUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPageUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationPageUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
