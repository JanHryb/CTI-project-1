const database = require("../config/databaseMysql");
const queryHelper = require("./queryHelper");

// FIXME: https://stackoverflow.com/questions/57208745/nodejs-function-wont-wait-for-postgresql-db-call-even-with-await
const validateCart = async (cart) => {
  let valid = false;
  const productsIdArr = cart.products;
  const quantity = cart.quanity;
  const totalPrice = cart.totalPrice;
  console.log(cart);
  await database.query(
    `select * from products ${queryHelper.whereIn(productsIdArr)};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const products = result;
      let quantityFromDB = 0;
      let totalPriceFromDB = 0;
      products.forEach((product) => {
        quantityFromDB += product.product_amount;
        totalPriceFromDB += product.product_price;
      });
      if (quantityFromDB == quantity && totalPriceFromDB == totalPrice) {
        valid = true;
        console.log(valid + "e");
      }
    }
  );
  await console.log(valid + "o");
  return await valid;
};

module.exports = { validateCart };
