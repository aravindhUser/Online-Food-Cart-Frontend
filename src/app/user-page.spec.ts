import { TestBed } from '@angular/core/testing';

import { UserPage } from './user-page';

describe('UserPage', () => {
  let service: UserPage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
