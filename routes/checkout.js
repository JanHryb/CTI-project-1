const router = require("express").Router();
const httpStatusCodes = require("../config/httpStatusCodes");
const database = require("../config/databaseMysql");
const auth = require("../middleware/auth");
const localStorage = require("local-storage");
const cartValidator = require("../utils/validateCart");
const jwt = require("jsonwebtoken");
const queryHelper = require("../utils/queryHelper");
const formValidator = require("../utils/validateForm");
const moment = require("moment")();

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
  database.query(
    ` select *
    from products
    inner join product_category on products.product_category_id = product_category.product_category_id
    ${queryHelper.whereIn(decodedCart.products)}`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      const products = result;
      const address = decodedCheckout.address;
      const totalPrice = decodedCheckout.totalPrice;
      database.query(
        `select * from shipping_options where shipping_option_id = ${decodedCheckout.shippingOptionId};`,
        (err, result) => {
          if (err) {
            console.log(err);
          }
          const shippingOptionName = result[0].shipping_option_name;
          database.query(
            `select * from payment_methods where payment_method_id = ${decodedCheckout.paymentMethodId};`,
            (err, result) => {
              if (err) {
                console.log(err);
              }
              const paymentMethodName = result[0].payment_method_name;
              return res.status(httpStatusCodes.OK).render("store/summary", {
                products,
                address,
                shippingOptionName,
                paymentMethodName,
                totalPrice,
              });
            }
          );
        }
      );
    }
  );
});

router.post("/summary", (req, res) => {
  const cart = req.session.cart;
  const checkout = req.session.checkout;
  let decodedCart;
  let decodedCheckout;

  if (cart == undefined) {
    return res.status(httpStatusCodes.BadRequest).redirect("/cart");
  }
  if (checkout == undefined) {
    return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
  }
  jwt.verify(cart, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(httpStatusCodes.BadRequest).redirect("/cart");
    }
    decodedCart = decoded;
  });
  console.log(decodedCart);
  jwt.verify(checkout, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(httpStatusCodes.BadRequest).redirect("/checkout");
    }
    decodedCheckout = decoded;
  });
  console.log(decodedCheckout);
  database.query(
    `call createAddress('${decodedCheckout.address.firstName}', '${decodedCheckout.address.lastName}', '${decodedCheckout.address.street}', '${decodedCheckout.address.streetNumber}', '${decodedCheckout.address.postalCode}', '${decodedCheckout.address.city}', '${decodedCheckout.address.email}', ${decodedCheckout.address.phoneNumber}, ${req.user.user_id});`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(httpStatusCodes.InternalServerError)
          .json("database error");
      }
      const addressId = parseInt(Object.values(result[0][0]));
      const orderDate = moment.format("YYYY-MM-DD HH:mm:ss");
      database.query(
        `call createOrder(${req.user.user_id}, ${addressId}, ${decodedCheckout.shippingOptionId}, '${orderDate}', '', 'in production')`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res
              .status(httpStatusCodes.InternalServerError)
              .json("database error");
          }
          console.log(result[0]);
          const orderId = parseInt(Object.values(result[0][0]));
          decodedCart.products.forEach((product, index) => {
            database.query(
              `call createOrderDetail(${orderId}, ${product.product_id}, 1);`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(httpStatusCodes.InternalServerError)
                    .json("database error");
                }
                if (index == decodedCart.products.length - 1) {
                  database.query(
                    `insert into payments(payment_method_id, payment_amount, order_id) values (${decodedCheckout.paymentMethodId}, ${decodedCart.totalPrice}, ${orderId});`,
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        return res
                          .status(httpStatusCodes.InternalServerError)
                          .json("database error");
                      }
                      delete req.session.cart;
                      delete req.session.checkout;
                      return res
                        .status(httpStatusCodes.Created)
                        .json(`order ${orderId} has been ordered`);
                    }
                  );
                }
              }
            );
          });
        }
      );
    }
  );
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
      const shippingOptionPrice = result[0].shipping_option_price;
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
            let cart = req.session.cart;
            jwt.verify(cart, process.env.JWT_SECRET, (err, decoded) => {
              if (err) {
                console.log(err);
              }
              cart = decoded.totalPrice;
            });
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
                totalPrice: cart + shippingOptionPrice,
              };
              const singedCheckout = jwt.sign(
                checkoutData,
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
              );
              delete req.session.checkout;
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
