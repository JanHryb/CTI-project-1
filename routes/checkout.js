const router = require("express").Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const auth = require("../middleware/auth");
const localStorage = require("local-storage");
const cartValidator = require("../utils/validateCart");

// TODO:
// DONE: check if user is logged in
// validate cart data with database
// form with address and shipping options
// summary of order -> place an order

router.get("/", auth.authenticated, async (req, res) => {
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    return res.status(httpStatusCodes.NotFound).redirect("cart");
  }

  const cart = localStorage.get("cart");
  // FIXME:
  const result = await cartValidator.validateCart(cart);
  return res.json(result);
});

module.exports = router;
