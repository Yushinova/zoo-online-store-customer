export class OrderResponse {
  constructor() {
    this.id = 0;
    this.orderNumber = '';
    this.shippingCost = 0;
    this.amount = 0;
    this.status = '';
    this.createdAt = null;
    this.shippingAddress = '';
    this.user = new UserOrderResponse();
    this.orderItems = [];//OrderItemResponse
  }
}
export class UserOrderResponse {
  constructor() {
    this.id = 0;
    this.name = '';
    this.phone = '';
  }
}
export class OrderRequest {
  constructor() {
    this.shippingCost = 0;
    this.amount = 0;
    this.status = '';
    this.shippingAddress = '';
    this.userId = 0;
    this.orderItems = [];//OrderItemRequest
  }
}

export class OrderUpdateRequest {
  constructor() {
    this.shippingCost = 0;
    this.status = '';
    this.shippingAddress = '';
  }
}
//////orderItem
export class OrderItemRequest{
   constructor(){
    this.quantity = 0;
    this.unitPrice = 0;
    this.price = 0;
    this.ProductName = '';
    this.productId = 0;
    this.orderId = 0;
  }
}

export class OrderItemResponse{
   constructor(){
    this.id = 0;
    this.quantity = 0;
    this.unitPrice = 0;
    this.price = 0;
    this.ProductName = '';
    this.productId = 0;
    this.orderId = 0;
  }
}
