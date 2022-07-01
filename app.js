require("dotenv").config();
const express = require("express");
const path = require("path");
const httpStatusCodes = require("./config/httpStatusCodes");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/index"));

app.get("*", (req, res) => {
	return res.status(httpStatusCodes.NotFound).render("notFound");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
