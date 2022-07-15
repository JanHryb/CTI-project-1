const database = require("../config/databaseMysql");
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    database.query(
      `select favourite_product_id from favourites where favourites.favourite_user_id = ${req.user.user_id}`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        const favourites = result;
        if (favourites.length > 0) {
          res.locals.favourites = favourites;
        }
        return next();
      }
    );
  } else {
    return next();
  }
};
