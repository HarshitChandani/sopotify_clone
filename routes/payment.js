const express = require("express")
const Router = express.Router()
const PremiumController = require("../controller/Premium/PaymentController")

Router.get("/upgrade",PremiumController.redirectToPremium)
Router.get("/premium",PremiumController.fetchAndDisplayPremiumAvailable)
Router.get("/payment/:premium_id",PremiumController.processPayment)
Router.post("/isPaymentCompletedAndVerified",PremiumController.isPaymentCompletedAndVerified)
Router.get("/confirm",PremiumController.getConfirmation)

module.exports = Router