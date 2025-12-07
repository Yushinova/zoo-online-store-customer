export class ProductResponse {
  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.price = 0;
    this.costPrice = 0;
    this.quantity = 0;
    this.brand = '';
    this.rating = 0;
    this.isPromotion = false;
    this.isActive = true;
    this.categoryId = 0;
    this.petTypes = [];
    this.productImages = [];
  }
}
///
export class ProductQueryParameters {
  constructor() {
    //пагинация
    this.page = 1;
    this.pageSize = 8;

    //сортировка и фильтры
    this.isActive = null;
    this.isPromotion = null;
    this.categoryId = null;
    this.petTypeId = null;
    this.name = null;
    this.rating = null;
    this.brand = null;
    this.minPrice = null;
    this.maxPrice = null;
  }
}