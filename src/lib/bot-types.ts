export type BotState = 
  | 'START' 
  | 'AWAITING_SERVICE_SELECTION'
  | 'AWAITING_QUANTITY' 
  | 'AWAITING_PAYMENT_CONFIRMATION' 
  | 'AWAITING_LINK' 
  | 'ORDER_PLACED' 
  | 'ERROR';

export interface UserSession {
  phoneNumber: string;
  state: BotState;
  lastMessage: string;
  data: {
    serviceId?: string;
    serviceName?: string;
    quantity?: number;
    price?: number;
    paymentLinkId?: string;
    targetLink?: string;
    orderId?: string;
    smmOrderId?: string;
  };
  updatedAt: number;
}

export interface OrderRecord {
  id: string;
  phoneNumber: string;
  serviceName: string;
  quantity: number;
  price: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PLACED' | 'FAILED';
  targetLink?: string;
  smmOrderId?: string;
  createdAt: number;
}
