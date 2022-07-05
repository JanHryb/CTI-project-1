const passport = require("passport");
const LocalStrategy = require("passport-local");
const database = require("../config/databaseMysql");
const bcrypt = require("bcrypt");

const verify = (email, password, done) => {
  database.query(
    `select * from users where user_email = '${email}';`,
    (err, result) => {
      if (err) {
        return done(err);
      }

      const user = result[0];
      if (!user) {
        return done(null, false, {
          message: "account with that email is not registered",
        });
      }
      if (!user.user_verified) {
        return done(null, false, {
          message: "please verify your account",
        });
      }
      bcrypt.compare(password, user.user_password, (err, result) => {
        if (err) {
          return done(err);
        }
        if (result) {
          return done(null, user);
        }
        return done(null, false, { message: "password incorrect" });
      });
    }
  );
};

passport.use(new LocalStrategy({ usernameField: "email" }, verify));
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});
passport.deserializeUser((id, done) => {
  database.query(`select * from users where user_id = ${id}`, (err, result) => {
    const user = result[0];
    done(err, user);
  });
});
