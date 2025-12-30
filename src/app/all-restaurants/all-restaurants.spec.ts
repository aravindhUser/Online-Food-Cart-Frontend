import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRestaurants } from './all-restaurants';

describe('AllRestaurants', () => {
  let component: AllRestaurants;
  let fixture: ComponentFixture<AllRestaurants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllRestaurants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllRestaurants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
