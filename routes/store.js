const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");
const queryHelper = require("../utils/queryHelper");
//TODO: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes#route_paths

router.get("/", (req, res) => {
  database.query(`select * from product_category`, (err, result) => {
    if (err) {
      console.log(err);
    }
    const productCategories = result;
    const sort = req.query.sort;
    database.query(
      `
    select * from products
    inner join product_category on products.product_category_id = product_category.product_category_id
    where products.product_amount > 0 
    ${queryHelper.orderBy(sort)}`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        const products = result;
        return res
          .status(httpStatusCodes.OK)
          .render("store/store", { productCategories, products, sort });
      }
    );
  });
});

router.get("/:category", (req, res, next) => {
  const categoryRoute = req.params.category;
  database.query(
    `select * from product_category where product_category_route = '${categoryRoute}';`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const category = result[0];
      if (category != undefined) {
        const sort = req.query.sort;
        database.query(
          ` select * from products
            where product_category_id = ${category.product_category_id}
            and products.product_amount > 0
            ${queryHelper.orderBy(sort)};`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const products = result;
            return res.status(httpStatusCodes.OK).render("store/category", {
              category,
              products,
              sort,
            });
          }
        );
      } else {
        return next();
      }
    }
  );
});

router.get("/:category/:product", (req, res, next) => {
  const categoryRoute = req.params.category;
  const productRoute = req.params.product;
  database.query(
    `select *
    from products
    inner join product_category on products.product_category_id = product_category.product_category_id
    where products.product_route = '${productRoute}'
    and product_category.product_category_route = '${categoryRoute}'
    and products.product_amount > 0;`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const product = result[0];
      if (product != undefined) {
        return res
          .status(httpStatusCodes.OK)
          .render("store/product", { product });
      } else {
        return next();
      }
    }
  );
});

module.exports = router;
