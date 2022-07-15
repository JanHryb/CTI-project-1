module.exports = (req, res, next) => {
  const url = req.originalUrl;
  if (url != "/" && url[url.length - 1] == "/") {
    let correctUrl = url.replace(/\/+$/, "");
    if (correctUrl == "") {
      correctUrl = "/";
    }
    return res.redirect(correctUrl);
  }
  return next();
};
