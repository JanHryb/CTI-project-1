module.exports = (req, res, next) => {
  res.locals.authenticated = req.isAuthenticated();
  return next();
};
