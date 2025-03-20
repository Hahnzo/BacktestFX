import { Injectable } from '@angular/core';
import { OHLCData } from '../models/market-data.model';
import { Order, OrderSide } from '../models/order.model';

declare const LightweightCharts: any;

@Injectable({
  providedIn: 'root'
})
export class TradingViewService {
  private chart: any;
  private candleSeries: any;
  private markers: any[] = [];

  constructor() { }

  initializeChart(container: HTMLElement): void {
    // Create chart
    this.chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333',
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

    // Add resize listener
    window.addEventListener('resize', () => {
      this.chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight
      });
    });

    // Create candlestick series
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: '#0ECB81',
      downColor: '#F6465D',
      borderUpColor: '#0ECB81',
      borderDownColor: '#F6465D',
      wickUpColor: '#0ECB81',
      wickDownColor: '#F6465D',
    });
  }

  setData(data: OHLCData[]): void {
    if (!this.candleSeries) {
      return;
    }
    
    this.candleSeries.setData(data);
    
    // Fit content to view
    this.chart.timeScale().fitContent();
  }

  addOrderMarkers(orders: Order[]): void {
    if (!this.candleSeries) {
      return;
    }
    
    this.markers = [];
    
    orders.forEach(order => {
      // Add entry marker
      this.markers.push({
        time: new Date(order.entryTime).getTime() / 1000,
        position: order.side === OrderSide.Buy ? 'belowBar' : 'aboveBar',
        color: order.side === OrderSide.Buy ? '#0ECB81' : '#F6465D',
        shape: order.side === OrderSide.Buy ? 'arrowUp' : 'arrowDown',
        text: `${order.side} ${order.quantity}`
      });
      
      // Add exit marker if available
      if (order.exitTime && order.exitPrice) {
        this.markers.push({
          time: new Date(order.exitTime).getTime() / 1000,
          position: 'inBar',
          color: order.pnL && order.pnL > 0 ? '#0ECB81' : '#F6465D',
          shape: 'circle',
          text: `Exit (${order.pnL ? order.pnL.toFixed(2) : '0.00'})`
        });
      }
    });
    
    this.candleSeries.setMarkers(this.markers);
  }

  destroy(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.candleSeries = null;
      this.markers = [];
    }
  }
}