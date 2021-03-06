const express = require("express");
const router = express.Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const bcrypt = require("bcrypt");
const passport = require("passport");
const queryHelper = require("../utils/queryHelper");
const auth = require("../middleware/auth");

router.get("/", auth.authenticated, (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/profile", req.user);
});

router.get("/orders", auth.authenticated, (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/orders");
});

router.get("/favourites", auth.authenticated, (req, res) => {
  database.query(
    `select favourites.favourite_product_id from favourites where favourites.favourite_user_id = ${req.user.user_id}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const favourites = result;
      const productsIdArr = [];
      favourites.forEach((fav) => {
        productsIdArr.push({ product_id: fav.favourite_product_id });
      });
      if (favourites.length > 0) {
        database.query(
          `select * from products inner join product_category on products.product_category_id = product_category.product_category_id
           ${queryHelper.whereIn(productsIdArr)}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            const products = result;
            res
              .status(httpStatusCodes.OK)
              .render("user/favourites", { products });
          }
        );
      } else {
        req.flash("favourite", "you don't have any favourite products yet");
        res.status(httpStatusCodes.NotFound).render("user/favourites");
      }
    }
  );
});

router.get("/favourites/add/:id", auth.authenticated, (req, res, next) => {
  const productId = req.params.id;
  if (Number.isNaN(Number(productId)) || req.headers.referer == undefined) {
    return next();
  }
  database.query(
    `select * from products where products.product_id = ${productId}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const product = result[0];
      if (product != undefined) {
        database.query(
          `select * from favourites where favourites.favourite_product_id = ${product.product_id} and favourites.favourite_user_id = ${req.user.user_id}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result[0] == undefined) {
              database.query(
                `insert into favourites(favourite_product_id, favourite_user_id) values (${product.product_id}, ${req.user.user_id})`,
                (err, result) => {
                  if (err) {
                    if (err.errno == 1062) {
                      return res
                        .status(httpStatusCodes.BadRequest)
                        .redirect(req.headers.referer);
                    } else {
                      console.log(err);
                    }
                  }
                  return res
                    .status(httpStatusCodes.Created)
                    .redirect(req.headers.referer);
                }
              );
            } else {
              return res
                .status(httpStatusCodes.BadRequest)
                .redirect(req.headers.referer);
            }
          }
        );
      } else {
        return next();
      }
    }
  );
});

router.get("/favourites/remove/:id", auth.authenticated, (req, res) => {
  const productId = req.params.id;
  if (Number.isNaN(Number(productId)) || req.headers.referer == undefined) {
    return next();
  }
  database.query(
    `select * from products where products.product_id = ${productId}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const product = result[0];
      if (product != undefined) {
        database.query(
          `delete from favourites where favourites.favourite_product_id = ${product.product_id} and favourites.favourite_user_id = ${req.user.user_id}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            return res.status(httpStatusCodes.OK).redirect(req.headers.referer);
          }
        );
      } else {
        return next();
      }
    }
  );
});

router.get("/favourites/clear", auth.authenticated, (req, res) => {
  database.query(
    `delete from favourites where favourites.favourite_user_id = ${req.user.user_id};`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return res.redirect("/user/favourites");
    }
  );
});

router.get("/register", auth.notAuthenticated, (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/register");
});

router.get("/login", auth.notAuthenticated, (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/login");
});

router.get("/logout", auth.authenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next();
    }
    req.flash("success", "you are logged out");
    return res.redirect("/user/login");
  });
});

router.post("/register", (req, res) => {
  let { firstName, lastName, email, password, passwordRepeat } = req.body;
  const hasWhiteSpace = (str) => {
    return str.indexOf(" ") >= 0;
  };
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  firstName = capitalizeFirstLetter(firstName);
  lastName = capitalizeFirstLetter(lastName);
  email = email.toLowerCase();

  if (hasWhiteSpace(firstName)) {
    req.flash("error", "first name can't contain space");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (hasWhiteSpace(lastName)) {
    req.flash("error", "last name can't contain space");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (hasWhiteSpace(email)) {
    req.flash("error", "email can't contain space");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (firstName.length < 3) {
    req.flash("error", "first name should contain at least 3 characters");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (lastName.length < 2) {
    req.flash("error", "last name should contain at least 2 characters");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (password.length < 6) {
    req.flash("error", "password should contain at least 6 characters");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }
  if (password !== passwordRepeat) {
    req.flash("error", "passwords aren't equal");
    return res
      .status(httpStatusCodes.BadRequest)
      .render("user/register", req.body);
  }

  database.query(
    `select * from users where user_email = '${email}';`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const user = result[0];
      if (user) {
        req.flash("user with that email already exist");
        return res
          .status(httpStatusCodes.BadRequest)
          .render("user/register", req.body);
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.log(err);
        }
        database.query(
          `insert into users(user_first_name, user_last_name, user_email, user_password, user_superuser, user_verified) values ('${firstName}', '${lastName}', '${email}', '${hash}', 0, 1);`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            req.flash("success", "you have been successfully registered");
            return res.status(httpStatusCodes.Created).redirect("/user/login");
          }
        );
      });
    }
  );
});

router.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/user",
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res) => {
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 14; //cookie expires after 14 days
    } else {
      req.session.cookie.maxAge = null; // cookie expires at end of session
    }
    return res.redirect("/user");
  }
);

module.exports = router;
