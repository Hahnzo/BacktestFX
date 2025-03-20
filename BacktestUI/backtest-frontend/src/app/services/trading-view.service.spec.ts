import { TestBed } from '@angular/core/testing';

import { TradingViewService } from './trading-view.service';

describe('TradingViewService', () => {
  let service: TradingViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradingViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
