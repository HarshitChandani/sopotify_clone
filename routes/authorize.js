const express = require("express");
const Router = express();
const AuthorizeController = require("../controller/AuthorizeController")


Router.get("/",AuthorizeController.authorizeUser)
Router.get("/callback",AuthorizeController.generateToken)

module.exports = Router