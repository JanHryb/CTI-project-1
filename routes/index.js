const express = require("express");
const httpStatusCodes = require("../config/httpStatusCodes");
const router = express.Router();
const database = require("../config/databaseMysql");

router.get("/", (req, res) => {
	return res.status(httpStatusCodes.OK).render("index");
});

module.exports = router;
