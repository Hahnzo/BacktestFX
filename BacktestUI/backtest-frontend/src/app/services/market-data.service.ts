// src/app/services/market-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private apiUrl = 'https://your-api-url.com/api'; // Replace with your .NET API URL
  private activeSubscriptions: Map<string, any> = new Map();
  private webSocket!: WebSocket;

  constructor(private http: HttpClient) {
    this.initWebSocket();
  }

  private initWebSocket() {
    this.webSocket = new WebSocket('wss://your-api-url.com/ws'); // Replace with your WebSocket URL
    
    this.webSocket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    this.webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'PRICE_UPDATE' && this.activeSubscriptions.has(data.subscriberUID)) {
        const callback = this.activeSubscriptions.get(data.subscriberUID);
        callback(data.bar);
      }
    };
    
    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
      setTimeout(() => this.initWebSocket(), 5000);
    };
  }

  searchSymbols(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/symbols/search?query=${query}`);
  }

  getSymbolInfo(symbol: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/symbols/${symbol}`).pipe(
      map(response => ({
        name: response.symbol,
        ticker: response.symbol,
        description: response.name,
        type: 'forex',
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: response.exchange,
        minmov: 1,
        pricescale: Math.pow(10, response.decimalPlaces),
        has_intraday: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
        currency_code: response.quoteCurrency,
        data_status: 'streaming'
      }))
    );
  }

  getBars(symbol: string, resolution: string, from: number, to: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/bars?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`
    ).pipe(
      map(response => {
        return response.map(bar => ({
          time: bar.timestamp * 1000, // Convert to milliseconds
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume
        }));
      })
    );
  }

  subscribeToBars(symbol: string, resolution: string, callback: Function, subscriberUID: string): void {
    this.activeSubscriptions.set(subscriberUID, callback);
    
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({
        action: 'subscribe',
        symbol: symbol,
        resolution: resolution,
        subscriberUID: subscriberUID
      }));
    }
  }

  unsubscribeFromBars(subscriberUID: string): void {
    if (this.activeSubscriptions.has(subscriberUID)) {
      this.activeSubscriptions.delete(subscriberUID);
      
      if (this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.send(JSON.stringify({
          action: 'unsubscribe',
          subscriberUID: subscriberUID
        }));
      }
    }
  }
}