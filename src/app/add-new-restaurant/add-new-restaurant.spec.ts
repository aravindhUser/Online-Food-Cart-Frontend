import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRestaurant } from './add-new-restaurant';

describe('AddNewRestaurant', () => {
  let component: AddNewRestaurant;
  let fixture: ComponentFixture<AddNewRestaurant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewRestaurant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewRestaurant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
