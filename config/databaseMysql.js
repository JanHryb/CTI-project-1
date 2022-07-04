const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "store",
});

connection.connect((err) => {
  if (err) console.log(err);
  else console.log("successfully connected to DB");
});

module.exports = connection;
