const localStorage = require("local-storage");
module.exports = (req, res, next) => {
  if (
    localStorage.get("cart") != null &&
    localStorage.get("cart").quantity > 0
  ) {
    res.locals.cartQuantity = localStorage.get("cart").quantity;
  }
  return next();
};
