const express = require("express")
const Router = express.Router()
const PlaylistController = require("../controller/PlaylistController")

Router.get("/like_playlist",PlaylistController.like_playlist)

module.exports = Router