class Cart {
  constructor(oldCart) {
    this.products = oldCart.products || [];
    this.quanity = oldCart.quanity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
  }

  addProduct(product) {
    let existing = false;

    this.products.forEach((item) => {
      if (item.product_id == product.product_id) {
        existing = true;
      }
    });

    if (!existing) {
      this.products.push({ product_id: product.product_id });
      this.quanity++;
      this.totalPrice += product.product_price;
      return true;
    } else {
      return false;
    }
  }

  removeProduct(product) {
    let existing = false;
    this.products.forEach((item) => {
      if (item.product_id == product.product_id) {
        existing = true;
      }
    });
    if (existing) {
      this.products = this.products.filter((item) => {
        return item.product_id !== product.product_id;
      });
      this.quanity--;
      this.totalPrice -= product.product_price;
      return true;
    } else {
      return false;
    }
  }

  clearCart() {
    this.products = [];
    this.quanity = 0;
    this.totalPrice = 0;
  }
}

module.exports = Cart;
