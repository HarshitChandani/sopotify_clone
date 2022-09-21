const {hash_password,generate16BypteHexRandom} = require("../utils/crypto")
const UserModel = require("../models/User")

let redirect_callback =  null

const redirectToLogin = (request,response) => {
   redirect_callback = request.query.continue
   response.render("authentication/login")
}

const login = async (request,response) => {
   const number = request.body.number
   const password = request.body.password
   hashed_password = hash_password(password)
   await UserModel.find({
      number:{$eq:number},
      password:{$eq:hashed_password}
   },{
      token:1
   }).then( (data,error) => {
      if (data.length == 0){ 
         response.status(401)
         return response.send({
            msg:"Unauthorized User",
            callback:null,
            detail:"User is not registered"
         })
      }else{
         fetched_data = {
            token: data[0].token,
            user_id:data[0]._id,
            name: `${data[0].f_name} ${data[0].l_name}`.toUpperCase(),
            isLoggedIn: true
         }
         
         // Create session.
         request.session.authentication = fetched_data
         
         // Send Response
         return response.status(200).send({
            msg:"Logged In",
            callback:redirect_callback != undefined ? redirect_callback : process.env.ROOT,
            detail:"User logged in successfully."
         })
      }
   }).catch( (error) => {
      console.log(error)
   })
}

const redirectToRegister = (request,response) => {
   redirect_callback = request.query.callback == undefined ? '/auth/login' : request.query.callback
   response.render(`authentication/register`)
}

const signup = async (request,response) => {
   const {f_name,l_name,number,password} = request.body;
   hashed_password = hash_password(password)
   token = generate16BypteHexRandom()
   await UserModel.find({  
      number:{$eq:number},
   }).then( (data,error) =>{
      if (data.length == 0){
         const newUser = new UserModel({
            f_name:f_name,
            l_name:l_name,
            number:number,
            password:hashed_password,
            token:token,
            like_playlist:[{}],
            premium: null
         }).save((error,data) => {
            if (data){
               return response.status(200).send({
                  "msg":"Successfully registered",
                  "callback":redirect_callback,
                  detail: null
               })
            }else{
               return response.status(500).send({
                  "msg":error,
                  "callback":null,
                  "detail":error
               })
            }
         })
      }else{
         return response.status(302).send({
            "msg":data,
            "callback":null,
            "detail":"User already exist."
         })
      }
   })
}

module.exports = {
   login:login,
   signup:signup,
   viewLogin:redirectToLogin,
   viewRegister:redirectToRegister
}