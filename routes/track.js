const express = require("express")
const Router = express.Router()

const {getTrackById} = require("../api/spoitfy_api")


Router.all("/getTrack",getTrackById)

module.exports = Router