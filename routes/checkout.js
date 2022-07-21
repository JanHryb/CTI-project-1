const router = require("express").Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const auth = require("../middleware/auth");
const localStorage = require("local-storage");
const cartValidator = require("../utils/validateCart");
const jwt = require("jsonwebtoken");

// TODO:
// DONE: check if user is logged in
// DONE: validate cart data with database and save cart data in safe place
// form with address and shipping options
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
        .render("store/checkout", { cart });
    } else {
      throw new Error("invalid cart");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(httpStatusCodes.BadRequest).redirect("/cart");
  }
});

module.exports = router;
