class Cart {
  constructor(oldCart) {
    this.products = oldCart.products || [];
    this.quantity = oldCart.quantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
  }

  addProduct(product) {
    let exist = false;

    this.products.forEach((item) => {
      if (item.product_id == product.product_id) {
        exist = true;
      }
    });

    if (!exist) {
      this.products.push({ product_id: product.product_id });
      this.quantity++;
      this.totalPrice += product.product_price;
      return true;
    } else {
      return false;
    }
  }

  removeProduct(product) {
    let exist = false;
    this.products.forEach((item) => {
      if (item.product_id == product.product_id) {
        exist = true;
      }
    });
    if (exist) {
      this.products = this.products.filter((item) => {
        return item.product_id !== product.product_id;
      });
      this.quantity--;
      this.totalPrice -= product.product_price;
      return true;
    } else {
      return false;
    }
  }

  clearCart() {
    this.products = [];
    this.quantity = 0;
    this.totalPrice = 0;
  }
}

module.exports = Cart;
