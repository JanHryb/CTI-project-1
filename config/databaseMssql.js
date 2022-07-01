const sql = require("mssql");

const connect = async () => {
	try {
		await sql
			.connect({
				user: "",
				password: "",
				database: "",
				server: "",
			})
			.then(() => {
				console.log("successfully connected to DB");
			});
	} catch (err) {
		console.log(err);
	}
};

module.exports = { connect };
