const router = require("express").Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const auth = require("../middleware/auth");
const localStorage = require("local-storage");
const cartValidator = require("../utils/validateCart");
const jwt = require("jsonwebtoken");
const queryHelper = require("../utils/queryHelper");
const formValidator = require("../utils/validateForm");

// TODO:
// DONE: check if user is logged in
// DONE: validate cart data with database and save cart data in safe place
// DONE: form with address and shipping options
// DONE: validate form data
// summary of order -> place an order

router.get("/", auth.authenticated, async (req, res) => {
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    return res.status(httpStatusCodes.NotFound).redirect("/cart");
  }

  delete req.session.checkout;
  const cart = localStorage.get("cart");
  try {
    const validCart = await cartValidator.validateCart(cart);
    if (validCart) {
      database.query(`select * from payment_methods;`, (err, result) => {
        if (err) {
          console.log(err);
        }
        const paymentMethods = result;
        database.query(`select * from shipping_options;`, (err, result) => {
          if (err) {
            console.log(err);
          }
          const shippingOptions = result;

          const productsIdArr = cart.products;
          const totalPrice = cart.totalPrice;
          database.query(
            ` select *
            from products
            inner join product_category on products.product_category_id = product_category.product_category_id
            ${queryHelper.whereIn(productsIdArr)}`,
            (err, result) => {
              if (err) {
                console.log(err);
              }
              const products = result;
              const singedCart = jwt.sign(cart, process.env.JWT_SECRET, {
                expiresIn: "1d",
              });
              let bodyData;
              if (req.session.bodyData == undefined) {
                bodyData = {
                  shippingOption: "",
                  paymentMethod: "",
                  firstName: "",
                  lastName: "",
                  street: "",
                  streetNumber: "",
                  postalCode: "",
                  city: "",
                  email: "",
                  phoneNumber: "",
                };
              } else {
                bodyData = req.session.bodyData;
                req.session.bodyData = {
                  shippingOption: "",
                  paymentMethod: "",
                  firstName: "",
                  lastName: "",
                  street: "",
                  streetNumber: "",
                  postalCode: "",
                  city: "",
                  email: "",
                  phoneNumber: "",
                };
              }
              req.session.cart = singedCart;
              return res.status(httpStatusCodes.OK).render("store/checkout", {
                products,
                totalPrice,
                paymentMethods,
                shippingOptions,
                bodyData,
              });
            }
          );
        });
      });
    } else {
      throw new Error("invalid cart");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(httpStatusCodes.BadRequest).redirect("/cart");
  }
});

router.get("/summary", auth.authenticated, (req, res) => {
  if (
    localStorage.get("cart") == null ||
    localStorage.get("cart").products.length == 0
  ) {
    return res.status(httpStatusCodes.NotFound).redirect("/cart");
  }

  const cart = req.session.cart;
  const checkout = req.session.checkout;

  if (cart == undefined) {
    return res.status(httpStatusCodes.BadRequest).redirect("/cart");
  }
  if (checkout == undefined) {
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  let decodedCart;
  jwt.verify(cart, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(httpStatusCodes.BadRequest).redirect("/cart");
    }
    decodedCart = decoded;
  });
  let decodedCheckout;
  jwt.verify(checkout, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
    }
    decodedCheckout = decoded;
  });
  // TODO:
  //console.log(decodedCart.products);
  return res
    .status(httpStatusCodes.OK)
    .render("store/summary", { decodedCart, decodedCheckout });
});

router.post("/", (req, res) => {
  let {
    shippingOption,
    paymentMethod,
    firstName,
    lastName,
    street,
    streetNumber,
    postalCode,
    city,
    email,
    phoneNumber,
  } = req.body;
  firstName = formValidator.capitalizeFirstLetter(firstName);
  lastName = formValidator.capitalizeFirstLetter(lastName);
  city = formValidator.capitalizeFirstLetter(city);
  street = formValidator.capitalizeFirstLetter(street);
  email = email.toLowerCase();

  if (formValidator.hasWhiteSpace(firstName)) {
    req.flash("error", "first name can't contain space");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (formValidator.hasWhiteSpace(lastName)) {
    req.flash("error", "last name can't contain space");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (formValidator.hasWhiteSpace(email)) {
    req.flash("error", "email can't contain space");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (firstName.length < 3) {
    req.flash("error", "first name should contain at least 3 characters");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (lastName.length < 2) {
    req.flash("error", "last name should contain at least 2 characters");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (postalCode.length != 6) {
    req.flash("error", "postal code contains of 6 characters (dd-ddd)");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  if (!formValidator.isNumber(phoneNumber) || phoneNumber.length != 9) {
    req.flash("error", "enter valid phone number");
    req.session.bodyData = req.body;
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  database.query(
    `select * from shipping_options where shipping_option_name = '${shippingOption}';`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(httpStatusCodes.InternalServerError)
          .redirect("/checkout");
      }
      if (result.length == 0) {
        return res
          .status(httpStatusCodes.InternalServerError)
          .redirect("/checkout");
      }
      const shippingOptionId = result[0].shipping_option_id;
      if (shippingOptionId != undefined) {
        database.query(
          `select * from payment_methods where payment_method_name = '${paymentMethod}';`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(httpStatusCodes.InternalServerError)
                .redirect("/checkout");
            }
            if (result.length == 0) {
              return res
                .status(httpStatusCodes.InternalServerError)
                .redirect("/checkout");
            }
            const paymentMethodId = result[0].payment_method_id;
            if (paymentMethodId != undefined) {
              const checkoutData = {
                address: {
                  firstName,
                  lastName,
                  street,
                  streetNumber,
                  postalCode,
                  city,
                  email,
                  phoneNumber,
                },
                shippingOptionId,
                paymentMethodId,
              };
              console.log(checkoutData);
              const singedCheckout = jwt.sign(
                checkoutData,
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
              );
              req.session.checkout = singedCheckout;
              return res
                .status(httpStatusCodes.OK)
                .redirect("/checkout/summary");
            } else {
              return res
                .status(httpStatusCodes.InternalServerError)
                .redirect("/checkout");
            }
          }
        );
      } else {
        return res
          .status(httpStatusCodes.InternalServerError)
          .redirect("/checkout");
      }
    }
  );
});

module.exports = router;
