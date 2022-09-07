const crypto = require("crypto")
const {stringify} = require("querystring")
const { fetch } = require("cross-fetch")
const moment = require("moment")
const SpotifyModel = require("../models/Spotify")

var previous_redirect = ''

// Pending
// exports.isTokenValid = async (request,response) => {
   
//    await SpotifyModel.countDocuments({}).then( async (data) => {
//       if (data == 0) {
//          // No Access Token Exist 
//          console.log("User is not authorized yet. ")
//          // response.redirect("/authorize")
//          return false
//       }
//       else{
//          let current_time,token_expiration_time
//          current_time = moment().toDate().getTime()
         
//          await SpotifyModel.find({}).then( async (data) => {
//             token_expiration_time = data[0].expires
//             const difference = moment(token_expiration_time).diff(moment(current_time),"seconds")
//             if ( (difference <= 5 && difference >= 0) || difference < 0   ){
//                // Generate new token by sending refresh token
//                await fetch("https://accounts.spotify.com/api/token",{
//                   method:"POST",
//                   body:  `grant_type=refresh_token&refresh_token=${data[0].refresh_token}`,
//                   headers:{
//                      'Content-Type': 'application/x-www-form-urlencoded',
//                      'Authorization': 'Basic ' + btoa(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)
//                   }
//                }).then(async (data) => {
//                   if (data.status == 200){
//                      const d = await data.json()
//                      d.expired_time = moment(moment().toDate().getTime()).add(1,'hours')
//                      response.cookie('spoitfyToken',d,{maxAge: d.expires_in * 1000 })

//                      SpotifyModel.findByIdAndUpdate(
//                         data[0]._id,
//                         { 
//                            access_token:d.access_token,
//                            expires: d.expired_time
//                         },{
//                            upsert:true
//                         }
//                      ).then((result,error) => {
//                         if (result){
//                            console.log("Access token has been refreshed")
//                            return true
//                         }else{
//                            console.error(`Error Occured: ${error}`)
//                            return false
//                         }
//                      })
//                      return true
//                   }else{
//                      console.log(data.statusText)
//                      return false
//                   }
//                })
//             }else{
//                // Token is active
//                return true
//             }
//          })
//       }
//    })
// }

function authorizeUser (request,response){
   const state = crypto.randomBytes(16).toString("hex");
   previous_redirect = request.query.previous_redirect_uri
   const credentials = {
      response_type:"code",
      client_id:process.env.CLIENT_ID,
      redirect_uri:'http://localhost:3000/authorize/callback',
      state:state,
      show_dialog:false
   }
   response.redirect('https://accounts.spotify.com/authorize?'+stringify(credentials))
}

async  function generateToken (request,response){
   const code = request.query.code
   const body_data = `grant_type=authorization_code&code=${code}&redirect_uri=http://localhost:3000/authorize/callback`
   await fetch('https://accounts.spotify.com/api/token', {
         method: 'POST',
         body: body_data,
         headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               'Authorization': 'Basic ' + btoa(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)
         }
   }).then( async (data)=>{
      if (data.status == 200){
         const d = await data.json()
         // setCookie('spoitfyToken',d.access_token,d.expires_in * 1000 * 24,response)
         response.cookie("spoitfyToken",d.access_token,{maxAge: d.expires_in * 1000 * 24 })
         setCookie('spotify_refresh_token',d.refresh_token,d.expires_in * 1000 * 24,response)
         response.redirect(previous_redirect)
      }
      else{
         console.log(data.statusText)
      }
   })
}

async function refresh_token (refresh_token){
   const spotify_url = 'https://accounts.spotify.com/api/token'
   const result = await fetch(spotify_url,{
      method:"POST",
      body: `grant_type=refresh_token&refresh_token=${refresh_token}`,
      headers:{
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + btoa(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)
      }
   })
   const data = await result.json()
   return data
}

function setCookie(name,value,max_age,response){
   response.cookie(name,value,{maxAge: max_age || 24 * 60 *60 * 1000})  // Defaults to one day
}

module.exports = {
   authorizeUser:authorizeUser,
   generateToken:generateToken,
   refresh_token : refresh_token,
   setCookie:setCookie
}