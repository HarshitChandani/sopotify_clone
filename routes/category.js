const express = require('express');

const Router = express.Router();

const HomeController = require("../controller/HomeController")

Router.get(
   "/",
   HomeController.getAllCategories)
Router.get("/category-playlist",HomeController.getCategoryPlaylist)
Router.get("/playlist-tracks",HomeController.getPlaylistTracks)

module.exports = Router