var express = require("express");
var router = express.Router();
var models = require("../models");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const app = express();

dotenv.config();

let PORT = process.env.PORT || 5000;

app.post("/generateToken", (req, res) => {

	let jwtSecretKey = process.env.JWT_SECRET_KEY;
	let data = {
		time: Date(),
		userId: 12,
	}

	const token = jwt.sign(data, jwtSecretKey);

	res.send(token);
});

app.get("/validateToken", (req, res) => {

	let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
	let jwtSecretKey = process.env.JWT_SECRET_KEY;

	try {
		const token = req.header(tokenHeaderKey);

		const verified = jwt.verify(token, jwtSecretKey);
		if(verified){
			return res.send("Successfully Verified");
		}else{
			// Access Denied
			return res.status(401).send(error);
		}
	} catch (error) {
		// Access Denied
		return res.status(401).send(error);
	}
});


module.exports = app;