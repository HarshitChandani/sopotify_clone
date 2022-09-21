const mongoose = require("mongoose")

const user_premiumSchema = new mongoose.Schema({
   user_id: mongoose.Types.ObjectId,
   premium_id:mongoose.Types.ObjectId,
   premium_status: {
      type: String,
      enum:{
         values:["active","expired"]
      }
   },
   transaction_id:mongoose.Types.ObjectId,
   start_date: String,
   start_time:String,
   end_date: String,
   end_time:String
},{
   collection:"user_premium"
})

module.exports = mongoose.model("user_premium",user_premiumSchema)