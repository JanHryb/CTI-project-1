const router = require("express").Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const auth = require("../middleware/auth");
const localStorage = require("local-storage");
const cartValidator = require("../utils/validateCart");
const jwt = require("jsonwebtoken");
const queryHelper = require("../utils/queryHelper");

// TODO:
// DONE: check if user is logged in
// DONE: validate cart data with database and save cart data in safe place
// DONE: form with address and shipping options
// validate form data
// summary of order -> place an order

router.get("/", auth.authenticated, async (req, res) => {
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    return res.status(httpStatusCodes.NotFound).redirect("/cart");
  }

  const cart = localStorage.get("cart");
  try {
    const validCart = await cartValidator.validateCart(cart);
    if (validCart) {
      database.query(`select * from payment_methods;`, (err, result) => {
        if (err) {
          console.log(err);
        }
        const paymentMethods = result;
        database.query(`select * from shipping_options;`, (err, result) => {
          if (err) {
            console.log(err);
          }
          const shippingOptions = result;

          const productsIdArr = cart.products;
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
              const singedCart = jwt.sign(cart, process.env.JWT_SECRET, {
                expiresIn: "1d",
              });
              return res
                .status(httpStatusCodes.OK)
                .cookie("cart", singedCart, {
                  httpOnly: true,
                  secure: true,
                  maxAge: 1000 * 60 * 60 * 24,
                })
                .render("store/checkout", {
                  products,
                  totalPrice,
                  paymentMethods,
                  shippingOptions,
                });
            }
          );
        });
      });
    } else {
      throw new Error("invalid cart");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(httpStatusCodes.BadRequest).redirect("/cart");
  }
});

router.post("/", (req, res) => {
  /// TODO: validate form data(also with db and after success redirect to summary.ejs)
  const {
    shippingOption,
    paymentMethod,
    firstName,
    lastName,
    street,
    streetNumber,
    postalCode,
    city,
    email,
    phoneNumber,
  } = req.body;
});

module.exports = router;
