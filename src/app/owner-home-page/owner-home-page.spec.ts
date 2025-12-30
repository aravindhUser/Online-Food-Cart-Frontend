import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerHomePage } from './owner-home-page';

describe('OwnerHomePage', () => {
  let component: OwnerHomePage;
  let fixture: ComponentFixture<OwnerHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerHomePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
