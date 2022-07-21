const database = require("../config/databaseMysql");
const queryHelper = require("./queryHelper");

const validateCart = (cart) => {
  return new Promise((resolve, reject) => {
    database.query(
      `select * from products ${queryHelper.whereIn(cart.products)};`,
      (err, result) => {
        if (err) {
          reject(err);
        }
        if (result.length == 0) {
          reject(new Error("invalid cart"));
        }
        let quantityFromDB = 0;
        let totalPriceFromDB = 0;
        result.forEach((product) => {
          quantityFromDB += product.product_amount;
          totalPriceFromDB += product.product_price;
        });
        if (
          quantityFromDB == cart.quantity &&
          totalPriceFromDB == cart.totalPrice
        ) {
          resolve(true);
        } else {
          reject(new Error("invalid cart"));
        }
      }
    );
  });
};

module.exports = { validateCart };
