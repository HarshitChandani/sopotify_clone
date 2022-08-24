const express = require('express');

const Router = express.Router();

const CategoryController = require("../controller/CategoryController")

Router.get("/",CategoryController.getAllCategories)
Router.get("/category-playlist",CategoryController.getCategoryPlaylist)
Router.get("/playlist-tracks",CategoryController.getPlaylistTracks)

module.exports = Router