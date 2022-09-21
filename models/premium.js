const mongoose = require("mongoose")
const Premiumschema = new mongoose.Schema({
   p_type:{
      type:String,
      required:true,
      unique:true
   },
   p_amt:{
      type:Number,
      min:[10,'Premium cannot be less than Rs 10.'],
   },
   period:{
      type:Number,
   },
   period_type:{
      type:String,
      enum:{
         values:['days','day','month','months','year','years'],
         message:`{VALUE} is not supported`
      }
   },
   benefits:[],
   terms_and_conditions:[],
   users_count:Number
},{
   collection:"premium"
})

module.exports = mongoose.model('premium',Premiumschema)