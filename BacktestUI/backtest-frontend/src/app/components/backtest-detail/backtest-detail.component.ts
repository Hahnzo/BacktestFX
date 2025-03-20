import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BacktestService } from '../../services/backtest.service';
import { MarketDataService } from '../../services/market-data.service';
import { Backtest } from '../../models/backtest.model';
import { Order, OrderSide, OrderStatus, OrderType } from '../../models/order.model';
import { OHLCData } from '../../models/market-data.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare const TradingView: any;

@Component({
  selector: 'app-backtest-detail',
  templateUrl: './backtest-detail.component.html',
  imports:[CommonModule, RouterModule, FormsModule],
  styleUrls: ['./backtest-detail.component.scss']
})
export class BacktestDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  backtest: Backtest | null = null;
  orders: Order[] = [];
  marketData: OHLCData[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  chart: any;
  selectedOrder: Order | null = null;
  orderFormVisible: boolean = false;

  // New order form data
  newOrder: Order = this.createEmptyOrder();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backtestService: BacktestService,
    private marketDataService: MarketDataService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadBacktest(id);
    });
  }

  ngAfterViewInit(): void {
    // TradingView chart will be initialized after backtest data is loaded
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.remove();
    }
  }

  loadBacktest(id: number): void {
    this.isLoading = true;
    this.backtestService.getBacktest(id).subscribe({
      next: (data) => {
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
      return;
    }

    const from = new Date(this.backtest.startDate);
    const to = new Date(this.backtest.endDate);

    this.marketDataService.getOHLCData(this.backtest.symbol, this.backtest.timeframe, from, to).subscribe({
      next: (data) => {
        this.marketData = data;
        this.isLoading = false;
        this.initializeChart();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load market data';
        this.isLoading = false;
        console.error('Error loading market data', error);
        
        // For demo purposes, generate fake data if no real data is available
        this.generateFakeMarketData();
        this.isLoading = false;
        this.initializeChart();
      }
    });
  }

  generateFakeMarketData(): void {
    if (!this.backtest) {
      return;
    }
    
    const startDate = new Date(this.backtest.startDate);
    const endDate = new Date(this.backtest.endDate);
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    const basePrice = 1.2000; // Example starting price for EURUSD
    let lastPrice = basePrice;
    
    this.marketData = [];
    
    for (let i = 0; i < dayDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Generate 24 hourly candles per day
      for (let hour = 0; hour < 24; hour++) {
        currentDate.setHours(hour);
        
        // Random price movement
        const change = (Math.random() - 0.5) * 0.002;
        const open = lastPrice;
        const close = open + change;
        const high = Math.max(open, close) + (Math.random() * 0.001);
        const low = Math.min(open, close) - (Math.random() * 0.001);
        const volume = Math.floor(Math.random() * 1000) + 500;
        
        lastPrice = close;
        
        this.marketData.push({
          time: Math.floor(currentDate.getTime() / 1000),
          open: parseFloat(open.toFixed(5)),
          high: parseFloat(high.toFixed(5)),
          low: parseFloat(low.toFixed(5)),
          close: parseFloat(close.toFixed(5)),
          volume: volume
        });
      }
    }
  }

  initializeChart(): void {
    if (!this.backtest || this.marketData.length === 0) {
      return;
    }
    
    // Create widget options
    const widgetOptions = {
      symbol: this.backtest.symbol,
      interval: this.convertTimeframeToInterval(this.backtest.timeframe),
      container_id: 'tradingview-chart',
      datafeed: this.createCustomDatafeed(),
      library_path: 'https://unpkg.com/lightweight-charts/dist/',
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
      ],
      enabled_features: [
        'study_templates'
      ],
      charts_storage_url: 'https://saveload.tradingview.com',
      client_id: 'backtestarena',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#0ECB81',
        'mainSeriesProperties.candleStyle.downColor': '#F6465D',
        'mainSeriesProperties.candleStyle.borderUpColor': '#0ECB81',
        'mainSeriesProperties.candleStyle.borderDownColor': '#F6465D',
        'mainSeriesProperties.candleStyle.wickUpColor': '#0ECB81',
        'mainSeriesProperties.candleStyle.wickDownColor': '#F6465D',
      }
    };
    
    // Initialize TradingView widget
    this.chart = new TradingView.widget(widgetOptions);
    
    // Add orders to chart once it's ready
    this.chart.onChartReady(() => {
      this.renderOrdersOnChart();
    });
  }

  createCustomDatafeed(): any {
    const self = this;
    
    return {
      onReady: (callback: any) => {
        setTimeout(() => callback({
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
        }));
      },
      resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any) => {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbolName,
            description: symbolName,
            type: 'forex',
            session: '24x7',
            timezone: 'UTC',
            minmov: 1,
            pricescale: 100000, // 5 decimal places for forex
            has_intraday: true,
            supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
          });
        });
      },
      getBars: (symbolInfo: any, resolution: string, from: number, to: number, onHistoryCallback: any) => {
        const bars = self.marketData.filter(bar => bar.time >= from && bar.time <= to);
        
        if (bars.length > 0) {
          onHistoryCallback(bars);
        } else {
          onHistoryCallback([], { noData: true });
        }
      },
      subscribeBars: () => {
        // Not implementing real-time updates for backtest
      },
      unsubscribeBars: () => {
        // Not implementing real-time updates for backtest
      }
    };
  }

  convertTimeframeToInterval(timeframe: string): string {
    // Convert API timeframe format to TradingView interval format
    switch (timeframe) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '30m': return '30';
      case '1h': return '60';
      case '4h': return '240';
      case '1d': return '1D';
      case '1w': return '1W';
      default: return '60'; // Default to 1h
    }
  }

  renderOrdersOnChart(): void {
    if (!this.chart || !this.orders.length) {
      return;
    }
    
    // Get chart instance
    const chart = this.chart.chart();
    
    this.orders.forEach(order => {
      if (order.status === OrderStatus.Filled) {
        // Draw entry point
        this.drawOrderMarker(chart, order, true);
        
        // Draw exit point if available
        if (order.exitTime && order.exitPrice) {
          this.drawOrderMarker(chart, order, false);
          
          // Draw line connecting entry and exit
          this.drawOrderLine(chart, order);
        }
      }
    });
  }

  drawOrderMarker(chart: any, order: Order, isEntry: boolean): void {
    const time = isEntry ? order.entryTime : order.exitTime!;
    const price = isEntry ? order.price : order.exitPrice!;
    const color = order.side === OrderSide.Buy ? '#0ECB81' : '#F6465D';
    const shape = isEntry ? 
                  (order.side === OrderSide.Buy ? 'arrow_up' : 'arrow_down') : 
                  'circle';
    
    chart.createShape(
      { price, time: new Date(time).getTime() / 1000 },
      {
        shape,
        text: isEntry ? 
             `${order.side} ${order.quantity}` : 
             `Exit ${order.pnL ? (order.pnL > 0 ? '+' : '') + order.pnL.toFixed(2) : ''}`,
        color,
        disableSelection: false,
        zOrder: 'top'
      }
    );
  }

  drawOrderLine(chart: any, order: Order): void {
    const color = order.pnL && order.pnL > 0 ? '#0ECB81' : '#F6465D';
    
    chart.createShape(
      [
        { price: order.price, time: new Date(order.entryTime).getTime() / 1000 },
        { price: order.exitPrice!, time: new Date(order.exitTime!).getTime() / 1000 }
      ],
      {
        shape: 'trend_line',
        color,
        disableSelection: false,
        zOrder: 'top'
      }
    );
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
    
    this.newOrder.backtestId = this.backtest.id;
    
    this.backtestService.createOrder(this.backtest.id!, this.newOrder).subscribe({
      next: (order) => {
        this.orders.push(order);
        this.hideOrderForm();
        this.renderOrdersOnChart();
      },
      error: (error) => {
        console.error('Error creating order', error);
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
    
    this.backtestService.updateOrder(this.backtest.id!, order.id, updatedOrder).subscribe({
      next: () => {
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
        console.error('Error closing order', error);
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
      this.backtestService.deleteOrder(this.backtest.id!, order.id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== order.id);
          this.selectedOrder = null;
          // Refresh chart
          this.chart.remove();
          this.initializeChart();
        },
        error: (error) => {
          console.error('Error deleting order', error);
        }
      });
    }
  }
}