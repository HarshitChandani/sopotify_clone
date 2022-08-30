const express = require("express")
const Router = express.Router()

const {
   getTrackById,
   getMultipleTracksById,
   getTracksByPlaylistId
} = require("../api/spoitfy_api")


Router.get("/getTrack",getTrackById)
Router.get("/getMultipleTrack",getMultipleTracksById)
Router.get("/getTracksByPlaylistId",getTracksByPlaylistId)

module.exports = Router