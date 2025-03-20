import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MarketData, OHLCData } from '../models/market-data.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private apiUrl = `${environment.apiUrl}/marketdata`;

  constructor(private http: HttpClient) { }

  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/symbols`);
  }

  getTimeframes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/timeframes`);
  }

  getMarketData(symbol: string, timeframe: string, from?: Date, to?: Date): Observable<MarketData[]> {
    let url = `${this.apiUrl}/${symbol}/${timeframe}`;
    
    const params: any = {};
    if (from) {
      params.from = from.toISOString();
    }
    
    if (to) {
      params.to = to.toISOString();
    }
    
    return this.http.get<MarketData[]>(url, { params });
  }
  
  // Convert to TradingView compatible format
  getOHLCData(symbol: string, timeframe: string, from?: Date, to?: Date): Observable<OHLCData[]> {
    return this.getMarketData(symbol, timeframe, from, to).pipe(
      map(data => data.map(candle => ({
        time: new Date(candle.timestamp).getTime() / 1000, // Convert to Unix timestamp in seconds
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      })))
    );
  }
}