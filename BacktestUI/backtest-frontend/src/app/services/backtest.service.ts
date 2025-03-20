import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Backtest } from '../models/backtest.model';
import { Order } from '../models/order.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class BacktestService {
  private apiUrl = `${environment.apiUrl}/backtest`;

  constructor(private http: HttpClient) { }

  getBacktests(): Observable<Backtest[]> {
    return this.http.get<Backtest[]>(this.apiUrl);
  }

  getBacktest(id: number): Observable<Backtest> {
    return this.http.get<Backtest>(`${this.apiUrl}/${id}`);
  }

  createBacktest(backtest: Backtest): Observable<Backtest> {
    return this.http.post<Backtest>(this.apiUrl, backtest);
  }

  updateBacktest(id: number, backtest: Backtest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, backtest);
  }

  deleteBacktest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Order related methods
  getOrders(backtestId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/${backtestId}/orders`);
  }

  getOrder(backtestId: number, orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${backtestId}/order/${orderId}`);
  }

  createOrder(backtestId: number, order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${backtestId}/order`, order);
  }

  updateOrder(backtestId: number, orderId: number, order: Order): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${backtestId}/order/${orderId}`, order);
  }

  deleteOrder(backtestId: number, orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${backtestId}/order/${orderId}`);
  }
}