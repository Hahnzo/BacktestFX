import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BacktestService } from '../../services/backtest.service';
import { Backtest } from '../../models/backtest.model';
import { NgIf, NgFor, NgClass, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, CurrencyPipe, DecimalPipe]
})
export class DashboardComponent implements OnInit {
  backtests: Backtest[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private backtestService: BacktestService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBacktests();
  }

  loadBacktests(): void {
    this.isLoading = true;
    this.backtestService.getBacktests().subscribe({
      next: (data) => {
        this.backtests = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load backtests';
        this.isLoading = false;
        console.error('Error loading backtests', error);
      }
    });
  }

  createNewBacktest(): void {
    this.router.navigate(['/backtest/new']);
  }

  openBacktest(id: number): void {
    this.router.navigate(['/backtest', id]);
  }

  deleteBacktest(event: Event, id: number): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this backtest?')) {
      this.backtestService.deleteBacktest(id).subscribe({
        next: () => {
          this.backtests = this.backtests.filter(b => b.id !== id);
        },
        error: (error) => {
          console.error('Error deleting backtest', error);
        }
      });
    }
  }
}