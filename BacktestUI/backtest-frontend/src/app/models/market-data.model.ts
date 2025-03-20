export interface MarketData {
    id?: number;
    symbol: string;
    timeframe: string;
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  // TradingView compatible OHLC format
  export interface OHLCData {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }