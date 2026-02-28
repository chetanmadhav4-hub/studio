
export type BotState = 
  | 'START' 
  | 'AWAITING_SERVICE_SELECTION'
  | 'AWAITING_QUANTITY' 
  | 'AWAITING_PAYMENT_CONFIRMATION' 
  | 'AWAITING_PAYMENT_DETAILS'
  | 'AWAITING_LINK' 
  | 'AWAITING_UTR_ID'
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
    utrId?: string;
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
  utrId?: string;
  smmOrderId?: string;
  createdAt: number;
}
