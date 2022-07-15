const localStorage = require("local-storage");
module.exports = (req, res, next) => {
  if (
    localStorage.get("cart") != null &&
    localStorage.get("cart").quanity > 0
  ) {
    res.locals.cartQuanity = localStorage.get("cart").quanity;
  }
  return next();
};
