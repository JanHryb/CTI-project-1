const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  if (
    req.originalUrl != "/user/logout" &&
    !req.originalUrl.startsWith("/user/favourites/")
  ) {
    req.flash("error", "please log in to view that resource");
  }
  if (req.originalUrl.startsWith("/user/favourites/")) {
    if (req.originalUrl == "/user/favourites/clear") {
      return res.redirect("/user/login");
    }
    req.flash("error", "log in to add to favourites");
  }
  return res.redirect("/user/login");
};

const notAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user");
};

module.exports = { authenticated, notAuthenticated };
