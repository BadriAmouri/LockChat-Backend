const express = require("express");
const { register, refreshToken } = require("../controllers/authController");
const {login} = require("../controllers/authController");
const {logout , resetPassword} = require("../controllers/authController");


const route = express.Router();

route.post("/register", register);
route.post("/login", login);
route.post("/refreshToken", refreshToken); 
route.post('/logout', logout);
route.post('/resetPassword', resetPassword);


module.exports = route;
