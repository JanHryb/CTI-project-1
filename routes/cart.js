const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");
const Cart = require("../models/Cart");
const localStorage = require("local-storage");

// TODO: https://stackoverflow.com/questions/2827764/ecommerceshopping-cartwhere-should-i-store-shopping-cart-data-in-session-or
// TODO: https://www.wiliam.com.au/wiliam-blog/where-should-you-store-your-cart
// TODO: https://hashnode.com/post/localstorage-vs-cookie-vs-database-which-one-is-good-for-cart-system-for-ecommerce-website-cjmrlv76r0046i2s1cf99kiwq

// TODO: user isn't logged: store cart in cookie
// TODO: user is logged: update the user cart table with local storage data
// TODO: checkout -> validate shopping cart

// TODO: database query selecing products data needed to display(route, name, img src, amount)
router.get("/", (req, res) => {
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    req.flash("cartStatus", "cart is empty");
    return res.render("cart/cart");
  }

  const cart = localStorage.get("cart");
  const products = cart.products;
  const quanity = cart.quanity;
  const totalPrice = cart.totalPrice;
  return res.render("cart/cart", { products, quanity, totalPrice });
});

// TODO: flash messages with redirect
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
      where products.product_id = ${productId};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.addProduct(product)) {
          localStorage.set("cart", cart);
          return res.json("product has been added");
        } else {
          return res.json("product is already added");
        }
      } else {
        return next();
      }
    }
  );
});

// TODO: flash messages with redirect
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
    return res.json("cart is empty");
  }

  database.query(
    ` select products.product_id, products.product_price
      from products
      where products.product_id = ${productId};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.removeProduct(product)) {
          localStorage.set("cart", cart);
          return res.json("product has been removed");
        } else {
          return res.json("product doesn't exist in cart");
        }
      } else {
        return next();
      }
    }
  );
});

// TODO: flash messages with redirect
router.get("/clear", (req, res) => {
  let cart;
  if (
    localStorage.get("cart") != null &&
    localStorage.get("cart").products.length > 0
  ) {
    cart = new Cart(localStorage.get("cart"));
  } else {
    return res.json("cart is empty");
  }

  cart.clearCart();
  localStorage.set("cart", cart);
  return res.json("cart is cleaned");
});

module.exports = router;
