require("dotenv").config();
const express = require("express");
const path = require("path");
const httpStatusCodes = require("./config/httpStatusCodes");
const session = require("express-session");
const flash = require("express-flash");
const mySqlStore = require("express-mysql-session")(session);
const passport = require("passport");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new mySqlStore({
      host: "localhost",
      user: "root",
      password: "",
      database: "store_cti",
      checkExpirationInterval: 10,
      clearExpired: true,
    }),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.authenticate("session"));
require("./config/passport");
app.use((req, res, next) => {
  res.locals.authenticated = req.isAuthenticated();
  return next();
});
app.use((req, res, next) => {
  const url = req.originalUrl;
  // if (url.includes("//")) {
  //   return res.redirect("/");
  // }
  if (url != "/" && url.slice(-1) == "/") {
    const correctUrl = url.slice(0, -1);
    return res.redirect(correctUrl);
  }
  return next();
});

app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
app.use("/store", require("./routes/store"));
app.use("/cart", require("./routes/cart"));

app.get("*", (req, res) => {
  return res.status(httpStatusCodes.NotFound).render("notFound");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
