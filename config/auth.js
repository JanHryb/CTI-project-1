const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  if (req.originalUrl != "/user/logout") {
    req.flash("error", "please log in to view that resource");
  }
  res.redirect("/user/login");
};

const notAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/user");
};

module.exports = { authenticated, notAuthenticated };
