const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");
const Cart = require("../models/Cart");

// TODO: https://stackoverflow.com/questions/2827764/ecommerceshopping-cartwhere-should-i-store-shopping-cart-data-in-session-or
// TODO: https://www.wiliam.com.au/wiliam-blog/where-should-you-store-your-cart
// TODO: https://hashnode.com/post/localstorage-vs-cookie-vs-database-which-one-is-good-for-cart-system-for-ecommerce-website-cjmrlv76r0046i2s1cf99kiwq
// TODO: user isn't logged: store cart in cookie
// TODO: user is logged: update the user cart table with cookie data
// TODO: checkout -> validate shopping cart

// TODO: cart.ejs, cart.js -> cookie store, after login database store!
router.get("/", (req, res) => {
  const cart = req.cookies.cart;
  console.log(cart);
  if (!cart || cart.products.length == 0) {
    return res.json("cart is empty");
  }
  const cartProducts = cart.products;
  const quanity = cart.quanity;
  const totalPrice = cart.totalPrice;
  return res.json(
    cartProducts[0].product_id + ", " + quanity + ", " + totalPrice
  );
});

router.get("/add/:id", (req, res, next) => {
  const productId = req.params.id;
  if (Number.isNaN(Number(productId))) {
    return next();
  }
  const cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  database.query(
    `select * from products where products.product_id = ${productId};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.addProduct(product)) {
          // req.session.cart = cart;
          return res
            .cookie("cart", cart, {
              maxAge: 1000 * 60 * 60 * 24 * 14,
              secure: true,
              httpOnly: true,
            })
            .json("product has been added");
        } else {
          return res.json("product is already added");
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
  const cart = new Cart(req.cookies.cart ? req.cookies.cart : {});
  if (cart.products.length == 0) {
    return res.json("cart is empty");
  }

  database.query(
    `select * from products where products.product_id = ${productId};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const product = result[0];
      if (product != undefined) {
        if (cart.removeProduct(product)) {
          // req.session.cart = cart;
          req.cookies.cart = cart;
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

router.get("/clear", (req, res) => {
  const cart = new Cart(req.cookies.cart ? req.cookies.cart : {});
  if (cart.products.length == 0) {
    return res.json("cart is empty");
  }
  cart.clearCart();
  console.log(cart);
  res.clearCookie("cart");
  console.log(req.cookies.cart);
  return res.json("cart is clear");
});

module.exports = router;
