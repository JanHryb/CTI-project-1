const express = require("express");
const router = express.Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/profile");
});

router.get("/register", (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/register");
});

router.get("/login", (req, res) => {
  return res.status(httpStatusCodes.OK).render("user/login");
});

router.post("/user/register", (req, res) => {
  const { firstName, lastName, email, password, passwordRepeat } = req.body;

  if (firstName.length < 3) {
    req.flash("error", "first name should contain at least 3 characters");
    return res.status(httpStatusCodes.BadRequest).render("user/register", {
      firstName,
      lastName,
      email,
      password,
      passwordRepeat,
    });
  }
  if (lastName.length < 2) {
    req.flash("error", "last name should contain at least 2 characters");
    return res.status(httpStatusCodes.BadRequest).render("user/register", {
      firstName,
      lastName,
      email,
      password,
      passwordRepeat,
    });
  }
  if (password.length < 6) {
    req.flash("error", "password should contain at least 6 characters");
    return res.status(httpStatusCodes.BadRequest).render("user/register", {
      firstName,
      lastName,
      email,
      password,
      passwordRepeat,
    });
  }
  if (password !== passwordRepeat) {
    req.flash("error", "passwords aren't equal");
    return res.status(httpStatusCodes.BadRequest).render("user/register", {
      firstName,
      lastName,
      email,
      password,
      passwordRepeat,
    });
  }

  database.query(
    `select * from users where user_email = '${email}'`,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      const user = result[0];
      if (user) {
        req.flash("user with that email already exist");
        return res.status(httpStatusCodes.BadRequest).render("user/register", {
          firstName,
          lastName,
          email,
          password,
          passwordRepeat,
        });
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.log(err);
        }
        req.flash("success", "you have been successfully registered");
        return res.status(httpStatusCodes.Created).redirect("user/login");
      });
    }
  );
});

module.exports = router;
