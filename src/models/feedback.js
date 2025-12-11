export class UserFeedbackResponse {
  constructor() {
    this.id = 0;
    this.name = '';
  }
}

export class FeedbackResponse {
  constructor() {
    this.id = 0;
    this.content = '';
    this.createdAt = new Date().toISOString();
    this.rating = 0;
    this.user = null; // UserFeedbackResponse object
    this.productId = 0;
  }
}

export class FeedbackRequest {
  constructor() {
    this.content = '';
    this.rating = 0;
    this.userId = 0;
    this.productId = 0;
  }
}