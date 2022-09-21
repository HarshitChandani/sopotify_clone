const mongoose =  require("mongoose")

const user_schema = new mongoose.Schema({
   f_name:String,
   l_name:String,
   number:{
      type:Number,
      required:true,
      index:true,  
      unique:true    
   },
   password:String,
   is_premium_user:{
      type:Boolean,
      default:false
   },
   token:{
      type:String,
      required:true,
      index:true,
      unique:true
   },
   like_playlist: {
      type:Array,
      unique:true
   },
   premium: {
      type: mongoose.Types.ObjectId,
      required: false,
      index:true
   }
   // premium_id:mongoose.Types.ObjectId
})

module.exports = mongoose.model("user",user_schema)