require("dotenv").config()

const express = require("express")
const path = require("path")
const cookie_parser = require("cookie-parser")

const route_category = require("./routes/category")
const route_track = require("./routes/track")
const {connect} =  require("./api/database")
const {getSpotifyToken} = require("./api/spoitfy_api")


const app =  express()
const PORT = process.env.PORT || 3000

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(cookie_parser())
app.use(express.static(path.join(__dirname,"public")))

connect()

app.use(async (request,response,next) => {
    if (!request.cookies.spoitfyToken){
        await getSpotifyToken().then( (token) => {
            if (token){
                response.cookie('spoitfyToken',token,{maxAge: 60*60*1000 })
                response.end()
            }
        })
    }
    next()
});

// app.get("/",CategoryController.getAllCategories)
app.use("/",route_category)
app.use("/track",route_track)

app.listen(PORT, "localhost", (req, res) => {
    console.log(`Node Server started at http://localhost:${PORT}`);
})   