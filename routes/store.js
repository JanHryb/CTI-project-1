const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");

router.get("/", (req, res) => {
  database.query(`select * from product_category;`, (err, result) => {
    if (err) {
      console.log(err);
    }
    const productCategories = result;
    database.query(
      `select products.product_id, products.product_name, products.product_description, products.product_price, products.product_amount, products.product_artist, products.product_release_date, products.product_image_path, products.product_route, product_category.product_category_name
      from products
      inner join product_category on products.product_category_id = product_category.product_category_id;`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        const products = result;
        let productsRoutes = [];
        products.forEach((product) => {
          const productRoute =
            product.product_category_name + "/" + product.product_route;
          // console.log(productRoute);
          productsRoutes.push(productRoute);
        });
        return res
          .status(httpStatusCodes.OK)
          .render("store/store", {
            productCategories,
            products,
            productsRoutes,
          });
      }
    );
  });
});

module.exports = router;
