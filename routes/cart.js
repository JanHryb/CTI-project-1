const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");
const Cart = require("../models/Cart");
const localStorage = require("local-storage");
const queryHelper = require("../utils/queryHelper");

// TODO: https://stackoverflow.com/questions/2827764/ecommerceshopping-cartwhere-should-i-store-shopping-cart-data-in-session-or
// TODO: https://www.wiliam.com.au/wiliam-blog/where-should-you-store-your-cart
// TODO: https://hashnode.com/post/localstorage-vs-cookie-vs-database-which-one-is-good-for-cart-system-for-ecommerce-website-cjmrlv76r0046i2s1cf99kiwq

// TODO: user isn't logged: store cart in local storage
// TODO: user is logged: update the user cart table with local storage data -> implement this in the future
// TODO: checkout -> validate shopping cart

router.get("/", (req, res) => {
  let exist = false;
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    req.flash("cart", "cart is empty");
    return res.status(httpStatusCodes.NotFound).render("store/cart", { exist });
  }

  exist = true;
  const cart = localStorage.get("cart");
  const productsIdArr = cart.products;
  const quanity = cart.quanity;
  const totalPrice = cart.totalPrice;
  database.query(
    ` select *
      from products
      inner join product_category on products.product_category_id = product_category.product_category_id
      ${queryHelper.whereIn(productsIdArr)}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const products = result;
      return res
        .status(httpStatusCodes.OK)
        .render("store/cart", { products, quanity, totalPrice, exist });
    }
  );
});

router.get("/add/:id", (req, res, next) => {
  const productId = req.params.id;
  if (Number.isNaN(Number(productId))) {
    return next();
  }
  let cart;
  if (localStorage.get("cart")) {
    cart = new Cart(localStorage.get("cart"));
  } else {
    cart = new Cart({});
  }

  database.query(
    ` select products.product_id, products.product_price
      from products
      where products.product_id = ${productId}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.addProduct(product)) {
          localStorage.set("cart", cart);
          req.flash("success", "product added to cart");
          return res
            .status(httpStatusCodes.Created)
            .redirect(req.headers.referer);
        } else {
          req.flash("error", "product already exist in cart");
          return res
            .status(httpStatusCodes.BadRequest)
            .redirect(req.headers.referer);
        }
      } else {
        return next();
      }
    }
  );
});

router.get("/remove/:id", (req, res, next) => {
  const productId = req.params.id;
  if (Number.isNaN(Number(productId))) {
    return next();
  }
  let cart;
  if (
    localStorage.get("cart") != null &&
    localStorage.get("cart").products.length > 0
  ) {
    cart = new Cart(localStorage.get("cart"));
  } else {
    return res.status(httpStatusCodes.NotFound).redirect("/cart");
  }

  database.query(
    ` select products.product_id, products.product_price
      from products
      where products.product_id = ${productId}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.removeProduct(product)) {
          localStorage.set("cart", cart);
          return res.status(httpStatusCodes.OK).redirect("/cart");
        } else {
          return res.status(httpStatusCodes.NotFound).redirect("/cart");
        }
      } else {
        return next();
      }
    }
  );
});

router.get("/clear", (req, res) => {
  let cart;
  if (
    localStorage.get("cart") != null &&
    localStorage.get("cart").products.length > 0
  ) {
    cart = new Cart(localStorage.get("cart"));
  } else {
    return res.status(httpStatusCodes.NotFound).redirect("/cart");
  }

  cart.clearCart();
  localStorage.set("cart", cart);
  return res.status(httpStatusCodes.OK).redirect("/cart");
});

module.exports = router;
