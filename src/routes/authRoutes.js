const express = require("express");
const { register } = require("../controllers/authController");

const route = express.Router();

route.post("/register", register);

module.exports = route;
