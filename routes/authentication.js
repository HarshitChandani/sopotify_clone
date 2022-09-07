const express = require("express")
const Router = express.Router()
const AuthenticationController = require("../controller/AuthenticationController")

Router.get('/login',AuthenticationController.viewLogin) 
Router.post('/login',AuthenticationController.login)

Router.get("/register",AuthenticationController.viewRegister)
Router.post("/register",AuthenticationController.signup)
module.exports = Router