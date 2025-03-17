// src/app/components/tradingview-chart/tradingview-chart.component.ts

import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { MarketDataService, SymbolInfo, Bar, SearchSymbolResult } from '../../services/market-data.service';

declare global {
  interface Window {
    TradingView: any;
  }
}

// TradingView types
interface LibrarySymbolInfo {
  name: string;
  full_name: string;
  description: string;
  type: string;
  session: string;
  exchange: string;
  listed_exchange: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  currency_code: string;
  ticker: string;
}

interface ResolutionCallback {
  (resolution: object): void;
}

interface SymbolResolveCallback {
  (symbolInfo: LibrarySymbolInfo): void;
}

interface ErrorCallback {
  (reason: string): void;
}

interface HistoryCallback {
  (bars: Bar[], meta: { noData: boolean }): void;
}

interface SearchSymbolsCallback {
  (symbols: SearchSymbolResult[]): void;
}

interface SubscribeBarsCallback {
  (bar: Bar): void;
}

@Component({
  selector: 'app-tradingview-chart',
  template: '<div #chartContainer class="chart-container"></div>',
  styles: [`
    .chart-container {
      height: 600px;
      width: 100%;
    }
  `]
})
export class TradingviewChartComponent implements OnInit {
  @Input() symbol: string = 'EURUSD';
  @Input() interval: string = '15';  // Timeframe in minutes
  
  private widget: any;
  
  constructor(
    private el: ElementRef,
    private marketDataService: MarketDataService
  ) {}
  
  ngOnInit(): void {
    this.createChart();
  }
  
  ngOnDestroy(): void {
    if (this.widget) {
      this.widget.remove();
      this.widget = null;
    }
  }
  
  createChart(): void {
    const container = this.el.nativeElement.querySelector('.chart-container');
    
    this.widget = new window.TradingView.widget({
      container_id: container,
      datafeed: this.createDatafeed(),
      library_path: '/assets/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'your_client_id',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      symbol: this.symbol,
      interval: this.interval,
      timezone: 'Etc/UTC',
      theme: 'Light',
      style: '1',
      toolbar_bg: '#f1f3f6',
      loading_screen: { backgroundColor: "#f4f4f4" },
      overrides: {
        "mainSeriesProperties.showCountdown": true,
        "paneProperties.background": "#f4f4f4",
        "paneProperties.vertGridProperties.color": "#e9e9e9",
        "paneProperties.horzGridProperties.color": "#e9e9e9"
      }
    });
  }
  
  createDatafeed() {
    return {
      onReady: (callback: ResolutionCallback) => {
        setTimeout(() => callback({
          supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M']
        }), 0);
      },
      searchSymbols: (
        userInput: string, 
        exchange: string, 
        symbolType: string, 
        onResultReadyCallback: SearchSymbolsCallback
      ) => {
        this.marketDataService.searchSymbols(userInput).subscribe((results: any) => {
          onResultReadyCallback(results);
        });
      },
      resolveSymbol: (
        symbolName: string, 
        onSymbolResolvedCallback: SymbolResolveCallback, 
        onResolveErrorCallback: ErrorCallback
      ) => {
        this.marketDataService.getSymbolInfo(symbolName).subscribe(
          (symbolInfo: any) => {
            onSymbolResolvedCallback(symbolInfo as LibrarySymbolInfo);
          },
          (error: any) => {
            onResolveErrorCallback('Cannot resolve symbol: ' + symbolName);
          }
        );
      },
      getBars: (
        symbolInfo: LibrarySymbolInfo, 
        resolution: string, 
        from: number, 
        to: number, 
        onHistoryCallback: HistoryCallback, 
        onErrorCallback: ErrorCallback, 
        firstDataRequest: boolean
      ) => {
        this.marketDataService.getBars(symbolInfo.name, resolution, from, to).subscribe(
          (bars: any) => {
            if (bars.length > 0) {
              onHistoryCallback(bars, { noData: false });
            } else {
              onHistoryCallback([], { noData: true });
            }
          },
          (error: any) => {
            onErrorCallback(error);
          }
        );
      },
      subscribeBars: (
        symbolInfo: LibrarySymbolInfo, 
        resolution: string, 
        onRealtimeCallback: SubscribeBarsCallback, 
        subscriberUID: string, 
        onResetCacheNeededCallback: () => void
      ) => {
        this.marketDataService.subscribeToBars(symbolInfo.name, resolution, onRealtimeCallback, subscriberUID);
      },
      unsubscribeBars: (subscriberUID: string) => {
        this.marketDataService.unsubscribeFromBars(subscriberUID);
      }
    };
  }
}