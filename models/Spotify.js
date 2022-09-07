/**
 * This Collection will contain only one document as it will store all the authorization details of a user.
 * access_token,refresh_token,expired timeout,type
 * If the collection is empty which means user is not yet authorized 
 * 
 */

const mongoose = require("mongoose")

const spotifySchema = new mongoose.Schema({
   access_token: {
      type:String,
      unique:true,
      required:true
   },
   refresh_token:{
      type:String,
      unique:true,
      required:true
   },
   type:String,
   expires_in_seconds:Number,
})

module.exports = mongoose.model("spotify",spotifySchema)