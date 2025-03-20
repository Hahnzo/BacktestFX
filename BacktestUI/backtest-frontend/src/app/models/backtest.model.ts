import { Order } from './order.model';

export interface Backtest {
  id?: number;
  name: string;
  description?: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  finalBalance?: number;
  totalPnL?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  winRate?: number;
  averageProfit?: number;
  averageLoss?: number;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  orders?: Order[];
}