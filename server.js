require("dotenv").config()

const express = require("express")
const path = require("path")
const body_parser = require("body-parser")
const cookie_parser = require("cookie-parser")
const express_session = require("express-session")
const MongoStore = require('connect-mongo')

// Routing
const route_category = require("./routes/category")
const route_track = require("./routes/track")
const route_authorize = require("./routes/authorize")
const route_playlist = require("./routes/playlist")
const route_authentication = require("./routes/authentication")

const {connect} =  require("./utils/database")

const app =  express()
const PORT = process.env.PORT || 3000

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use(cookie_parser())
app.use(express_session({
    secret:'my secret',
    resave:false,
    saveUninitialized: true,
    store: MongoStore.create({
       mongoUrl: process.env.MONGO_URI,
       collectionName:'sessions'
    }),
    cookie:{
       maxAge: 1000 * 24 * 60 * 60
    }
 }))

app.use(express.static(path.join(__dirname,"public")))
// Parser Content-Type: applicaton/www.form-urlencoded
app.use(body_parser.urlencoded({extended:true}))
// Parser Content-Type:application/json
app.use(body_parser.json())

app.use( (request,response,next) => {
    response.locals.loggedInUser = request.session.authentication != null ? true : false
    next()
})

app.use("/authorize",route_authorize)
app.use( (request,response,next) => {
    if (request.cookies.spoitfyToken == undefined) {
        response.redirect(`/authorize?previous_redirect_uri=/`)
    }
    next()
})

app.use("/",route_category)
app.use("/auth",route_authentication)
app.use("/track",route_track)
app.use("/playlist",route_playlist)

connect()

app.listen(PORT, "localhost", (req, res) => {
    console.log(`Node Server started at http://localhost:${PORT}`);
})   