import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BacktestService } from '../../services/backtest.service';
import { MarketDataService } from '../../services/market-data.service';
import { Backtest } from '../../models/backtest.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-backtest-form',
  imports:[CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './backtest-form.component.html',
  styleUrls: ['./backtest-form.component.scss']
})
export class BacktestFormComponent implements OnInit {
  backtestForm: FormGroup;
  symbols: string[] = [];
  timeframes: string[] = [];
  isLoading: boolean = false;
  isEditMode: boolean = false;
  backtestId: number | null = null;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private backtestService: BacktestService,
    private marketDataService: MarketDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.backtestForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSymbols();
    this.loadTimeframes();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.backtestId = +params['id'];
        this.loadBacktest(this.backtestId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      symbol: ['', Validators.required],
      timeframe: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      initialBalance: [10000, [Validators.required, Validators.min(0)]]
    });
  }

  loadSymbols(): void {
    this.marketDataService.getSymbols().subscribe({
      next: (data) => {
        this.symbols = data;
        
        // If no symbols are available, add some default ones for testing
        if (this.symbols.length === 0) {
          this.symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD'];
        }
      },
      error: (error) => {
        console.error('Error loading symbols', error);
        // Add default symbols for testing
        this.symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD'];
      }
    });
  }

  loadTimeframes(): void {
    this.marketDataService.getTimeframes().subscribe({
      next: (data) => {
        this.timeframes = data;
        
        // If no timeframes are available, add some default ones for testing
        if (this.timeframes.length === 0) {
          this.timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
        }
      },
      error: (error) => {
        console.error('Error loading timeframes', error);
        // Add default timeframes for testing
        this.timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
      }
    });
  }

  loadBacktest(id: number): void {
    this.isLoading = true;
    this.backtestService.getBacktest(id).subscribe({
      next: (backtest) => {
        this.backtestForm.patchValue({
          name: backtest.name,
          description: backtest.description,
          symbol: backtest.symbol,
          timeframe: backtest.timeframe,
          startDate: new Date(backtest.startDate).toISOString().split('T')[0],
          endDate: new Date(backtest.endDate).toISOString().split('T')[0],
          initialBalance: backtest.initialBalance
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading backtest', error);
        this.errorMessage = 'Failed to load backtest';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.backtestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.backtestForm.value;
    
    const backtest: Backtest = {
      name: formValue.name,
      description: formValue.description,
      symbol: formValue.symbol,
      timeframe: formValue.timeframe,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      initialBalance: formValue.initialBalance
    };

    if (this.isEditMode && this.backtestId) {
      backtest.id = this.backtestId;
      this.backtestService.updateBacktest(this.backtestId, backtest).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/backtest', this.backtestId]);
        },
        error: (error) => {
          console.error('Error updating backtest', error);
          this.errorMessage = 'Failed to update backtest';
          this.isLoading = false;
        }
      });
    } else {
      this.backtestService.createBacktest(backtest).subscribe({
        next: (newBacktest) => {
          this.isLoading = false;
          this.router.navigate(['/backtest', newBacktest.id]);
        },
        error: (error) => {
          console.error('Error creating backtest', error);
          this.errorMessage = 'Failed to create backtest';
          this.isLoading = false;
        }
      });
    }
  }
}