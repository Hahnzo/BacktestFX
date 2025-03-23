import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BacktestService } from '../../services/backtest.service';
import { MarketDataService } from '../../services/market-data.service';
import { Backtest } from '../../models/backtest.model';
import { Order, OrderSide, OrderStatus, OrderType } from '../../models/order.model';
import { OHLCData } from '../../models/market-data.model';
import { NgIf, NgFor, NgClass, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import Lightweight Charts correctly
import * as LightweightCharts from 'lightweight-charts';

@Component({
  selector: 'app-backtest-detail',
  templateUrl: './backtest-detail.component.html',
  styleUrls: ['./backtest-detail.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, 
    RouterLink, 
    FormsModule,
    DatePipe, CurrencyPipe, DecimalPipe
  ]
})
export class BacktestDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  backtest: Backtest | null = null;
  orders: Order[] = [];
  marketData: OHLCData[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  chart: any;
  candleSeries: any;
  selectedOrder: Order | null = null;
  orderFormVisible: boolean = false;

  // New order form data
  newOrder: Order = this.createEmptyOrder();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backtestService: BacktestService,
    private marketDataService: MarketDataService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadBacktest(id);
    });
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data is loaded
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  loadBacktest(id: number): void {
    this.isLoading = true;
    this.backtestService.getBacktest(id).subscribe({
      next: (data) => {
        console.log('Backtest loaded:', data);
        this.backtest = data;
        this.orders = data.orders || [];
        this.loadMarketData();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load backtest';
        this.isLoading = false;
        console.error('Error loading backtest', error);
      }
    });
  }

  loadMarketData(): void {
    if (!this.backtest) {
      console.error('No backtest available');
      return;
    }

    console.log('Loading market data for', this.backtest.symbol, this.backtest.timeframe);
    const from = new Date(this.backtest.startDate);
    const to = new Date(this.backtest.endDate);

    this.marketDataService.getOHLCData(this.backtest.symbol, this.backtest.timeframe, from, to).subscribe({
      next: (data) => {
        console.log('Market data loaded:', data.length, 'candles');
        this.marketData = data;
        this.isLoading = false;

        // Check if we have data, generate test data if needed
        if (!this.marketData || this.marketData.length === 0) {
          console.warn('Market data is empty, generating fake data');
          this.generateFakeMarketData();
        }
        
        // Use setTimeout to ensure DOM is completely rendered
        setTimeout(() => {
          this.initializeChart();
        }, 300);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load market data';
        this.isLoading = false;
        console.error('Error loading market data', error);
        
        // Generate fake data for testing
        this.generateFakeMarketData();
        
        setTimeout(() => {
          this.initializeChart();
        }, 300);
      }
    });
  }

  generateFakeMarketData(): void {
    console.log('Generating fake market data');
    if (!this.backtest) {
      console.error('Cannot generate fake data: backtest is null');
      return;
    }
    
    const startDate = new Date(this.backtest.startDate);
    const endDate = new Date(this.backtest.endDate);
    
    // Use default dates if needed
    let start = startDate;
    let end = endDate;
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Invalid dates, using defaults');
      const today = new Date();
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      end = new Date(today);
    }
    
    console.log('Using date range:', start, 'to', end);
    const dayDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    
    const basePrice = 1.2000; // Example starting price for EURUSD
    let lastPrice = basePrice;
    
    this.marketData = [];
    
    // Map to store unique timestamps
    const timestampMap = new Map();
    
    for (let i = 0; i < dayDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Generate 24 hourly candles per day
      for (let hour = 0; hour < 24; hour++) {
        currentDate.setHours(hour, 0, 0, 0); // Set to exact hour with 0 minutes, seconds, milliseconds
        
        // Random price movement
        const change = (Math.random() - 0.5) * 0.002;
        const open = lastPrice;
        const close = open + change;
        const high = Math.max(open, close) + (Math.random() * 0.001);
        const low = Math.min(open, close) - (Math.random() * 0.001);
        const volume = Math.floor(Math.random() * 1000) + 500;
        
        lastPrice = close;
        
        const timestamp = Math.floor(currentDate.getTime() / 1000);
        
        // Ensure we don't have duplicate timestamps
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, {
            time: timestamp,
            open: parseFloat(open.toFixed(5)),
            high: parseFloat(high.toFixed(5)),
            low: parseFloat(low.toFixed(5)),
            close: parseFloat(close.toFixed(5)),
            volume: volume
          });
        }
      }
    }
    
    // Convert map to array and sort
    this.marketData = Array.from(timestampMap.values()).sort((a, b) => a.time - b.time);
    console.log('Generated', this.marketData.length, 'fake candles');
  }

  initializeChart(): void {
    this.ngZone.runOutsideAngular(() => {
      try {
        console.log('Starting chart initialization...');
        
        if (!this.backtest) {
          console.error('Cannot initialize chart: No backtest data');
          return;
        }
        
        if (!this.marketData || this.marketData.length === 0) {
          console.error('Cannot initialize chart: No market data');
          return;
        }
        
        console.log('Market data available:', this.marketData.length, 'candles');
        
        // Get container element
        const container = document.getElementById('tradingview-chart');
        if (!container) {
          console.error('Chart container element not found');
          return;
        }
        
        console.log('Container found with dimensions:', container.clientWidth, 'x', container.clientHeight);
        
        // Clear any previous chart
        container.innerHTML = '';
        
        // Set explicit dimensions if needed
        if (!container.clientHeight || container.clientHeight < 200) {
          container.style.height = '500px';
        }
        
        // Create chart with the imported library
        this.chart = LightweightCharts.createChart(container, {
          width: container.clientWidth || 800,
          height: container.clientHeight || 500,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333333',
          },
          grid: {
            vertLines: {
              color: 'rgba(197, 203, 206, 0.5)',
            },
            horzLines: {
              color: 'rgba(197, 203, 206, 0.5)',
            },
          },
          crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
          },
          rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
            timeVisible: true,
            secondsVisible: false,
          },
        });
        
        console.log('Chart created:', this.chart);
        
        // Add resize listener
        window.addEventListener('resize', () => {
          if (this.chart) {
            this.chart.applyOptions({
              width: container.clientWidth,
            });
          }
        });
        
        // Add candlestick series
        this.candleSeries = this.chart.addCandlestickSeries({
          upColor: '#0ECB81',
          downColor: '#F6465D',
          borderUpColor: '#0ECB81',
          borderDownColor: '#F6465D',
          wickUpColor: '#0ECB81',
          wickDownColor: '#F6465D',
        });
        
        console.log('Candlestick series added:', this.candleSeries);
        
        // Process market data to ensure no duplicate timestamps
        const uniqueTimeMap = new Map();
        
        // Process data to ensure unique timestamps
        this.marketData.forEach(item => {
          uniqueTimeMap.set(item.time, {
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close
          });
        });
        
        // Convert map to array and sort by timestamp
        const formattedData = Array.from(uniqueTimeMap.values()).sort((a, b) => a.time - b.time);
        
        console.log('Processed data:', formattedData.length, 'candles (after removing duplicates)');
        if (formattedData.length > 0) {
          console.log('First candle:', formattedData[0]);
          console.log('Last candle:', formattedData[formattedData.length - 1]);
        }
        
        // Check for duplicate timestamps in debug mode
        const timeMap = new Map();
        let hasDuplicates = false;
        formattedData.forEach((item, index) => {
          if (timeMap.has(item.time)) {
            console.error(`Duplicate timestamp detected at index ${index}: ${item.time} - First seen at index ${timeMap.get(item.time)}`);
            hasDuplicates = true;
          } else {
            timeMap.set(item.time, index);
          }
        });
        
        if (hasDuplicates) {
          console.warn('Duplicate timestamps detected in data - this will cause chart rendering errors');
        }
        
        // Add data to chart
        this.candleSeries.setData(formattedData);
        
        // Add markers for orders
        if (this.orders && this.orders.length > 0) {
          this.renderOrdersOnChart();
        }
        
        // Fit content
        this.chart.timeScale().fitContent();
        
        console.log('Chart initialization completed successfully');
      } catch (error: any) {
        console.error('Error initializing chart:', error);
        
        // Try rendering a simple message in the container
        const container = document.getElementById('tradingview-chart');
        if (container) {
          container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column;">
              <p style="color: red; font-weight: bold;">Error loading chart</p>
              <p>${error.message}</p>
              <button id="retry-chart" style="margin-top: 10px; padding: 5px 10px;">Retry</button>
            </div>
          `;
          
          document.getElementById('retry-chart')?.addEventListener('click', () => {
            this.initializeChart();
          });
        }
      }
    });
  }

  renderOrdersOnChart(): void {
    if (!this.chart || !this.candleSeries || !this.orders || this.orders.length === 0) {
      console.warn('Cannot render orders: chart, series, or orders missing');
      return;
    }
    
    console.log('Rendering', this.orders.length, 'orders on chart');
    
    try {
      const markers: any = [];
      
      this.orders.forEach(order => {
        if (!order.entryTime) {
          console.warn('Order missing entry time, skipping', order);
          return;
        }
        
        const entryTimestamp = Math.floor(new Date(order.entryTime).getTime() / 1000);
        
        // Entry marker
        markers.push({
          time: entryTimestamp,
          position: order.side === OrderSide.Buy ? 'belowBar' : 'aboveBar',
          color: order.side === OrderSide.Buy ? '#0ECB81' : '#F6465D',
          shape: order.side === OrderSide.Buy ? 'arrowUp' : 'arrowDown',
          text: `${order.side} ${order.quantity}`
        });
        
        // Exit marker (if available)
        if (order.exitTime && order.exitPrice) {
          const exitTimestamp = Math.floor(new Date(order.exitTime).getTime() / 1000);
          
          markers.push({
            time: exitTimestamp,
            position: 'inBar',
            color: order.pnL && order.pnL > 0 ? '#0ECB81' : '#F6465D',
            shape: 'circle',
            text: `Exit ${order.pnL ? (order.pnL > 0 ? '+' : '') + order.pnL.toFixed(2) : ''}`
          });
        }
      });
      
      console.log('Setting markers:', markers.length);
      
      // Set markers on the series
      this.candleSeries.setMarkers(markers);
    } catch (error) {
      console.error('Error rendering orders on chart:', error);
    }
  }

  showOrderForm(): void {
    this.orderFormVisible = true;
    this.selectedOrder = null;
    this.newOrder = this.createEmptyOrder();
  }

  hideOrderForm(): void {
    this.orderFormVisible = false;
  }

  createEmptyOrder(): Order {
    return {
      type: OrderType.Market,
      side: OrderSide.Buy,
      status: OrderStatus.Pending,
      price: 0,
      quantity: 1,
      entryTime: new Date()
    };
  }

  onOrderSubmit(): void {
    if (!this.backtest) {
      return;
    }
    
    console.log('Submitting order:', this.newOrder);
    this.newOrder.backtestId = this.backtest.id;
    
    this.backtestService.createOrder(this.backtest.id!, this.newOrder).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
        this.orders.push(order);
        this.hideOrderForm();
        this.renderOrdersOnChart();
      },
      error: (error) => {
        console.error('Error creating order:', error);
      }
    });
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrder(order: Order): void {
    if (!this.backtest || !order.id) {
      return;
    }
    
    // Set exit price (for demo we'll just use the last candle's close price)
    const lastCandle = this.marketData[this.marketData.length - 1];
    
    const updatedOrder: Order = {
      ...order,
      status: OrderStatus.Filled,
      exitTime: new Date(),
      exitPrice: lastCandle.close,
      pnL: this.calculatePnL(order, lastCandle.close)
    };
    
    console.log('Closing order:', updatedOrder);
    
    this.backtestService.updateOrder(this.backtest.id!, order.id, updatedOrder).subscribe({
      next: () => {
        console.log('Order closed successfully');
        // Update the order in the local array
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.selectedOrder = null;
        
        // Refresh chart
        this.renderOrdersOnChart();
      },
      error: (error) => {
        console.error('Error closing order:', error);
      }
    });
  }

  calculatePnL(order: Order, exitPrice: number): number {
    const direction = order.side === OrderSide.Buy ? 1 : -1;
    const priceDiff = direction * (exitPrice - order.price);
    return priceDiff * order.quantity * 100000; // Assuming standard lot size for forex
  }

  deleteOrder(order: Order): void {
    if (!this.backtest || !order.id) {
      return;
    }
    
    if (confirm('Are you sure you want to delete this order?')) {
      console.log('Deleting order:', order);
      
      this.backtestService.deleteOrder(this.backtest.id!, order.id).subscribe({
        next: () => {
          console.log('Order deleted successfully');
          this.orders = this.orders.filter(o => o.id !== order.id);
          this.selectedOrder = null;
          
          // Refresh chart
          this.renderOrdersOnChart();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
        }
      });
    }
  }
}