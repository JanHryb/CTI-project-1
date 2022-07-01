const mysql = require("mysql");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "cti_project_1",
});

connection.connect((err) => {
	if (err) console.log(err);
	else console.log("successfully connected to DB");
});

module.exports = connection;
