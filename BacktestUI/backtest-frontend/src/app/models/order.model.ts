export enum OrderType {
    Market = 'Market',
    Limit = 'Limit',
    Stop = 'Stop',
    StopLimit = 'StopLimit'
  }
  
  export enum OrderSide {
    Buy = 'Buy',
    Sell = 'Sell'
  }
  
  export enum OrderStatus {
    Pending = 'Pending',
    Filled = 'Filled',
    Cancelled = 'Cancelled',
    Rejected = 'Rejected'
  }
  
  export interface Order {
    id?: number;
    type: OrderType;
    side: OrderSide;
    status: OrderStatus;
    price: number;
    stopPrice?: number;
    quantity: number;
    takeProfit?: number;
    stopLoss?: number;
    entryTime: Date;
    exitTime?: Date;
    exitPrice?: number;
    pnL?: number;
    createdAt?: Date;
    updatedAt?: Date;
    backtestId?: number;
  }