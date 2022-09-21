const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema({
   premium_id:{
      type:mongoose.Types.ObjectId,
      index:true,
   },
   user_id:{
      type:String,
      required:true,
      index:true
   },
   order_id:{
      type:String,
      index:true
   },
   t_id: {
      type:String,
      unique:true,
      required:true,
      index:true
   },
   t_date_time:String,
   t_amt:Number,
   t_status:Boolean,
   t_status_msg:String,
   t_status_code:String,
   t_currency: String,
   payment_gateway:String,
   t_bank_transaction_id: String,
   t_bank: String,
   t_mode: {
      type:String,
      enum:{
         values: ["PPI","UPI","CC","DC","NB"]
      }
   }
},{
   collection:"transactions"
})

module.exports = mongoose.model("transaction",TransactionSchema)