import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestDetailComponent } from './backtest-detail.component';

describe('BacktestDetailComponent', () => {
  let component: BacktestDetailComponent;
  let fixture: ComponentFixture<BacktestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacktestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BacktestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
