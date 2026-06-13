const mongoose= require("mongoose");
  const transactionschema= new mongoose.Schema({

   fromaccount:{
     type: String,
        required:[  true,"fromaccount is required"],
        index:true
   } ,
    toaccount:{
     type: String,
        required:[  true,"toaccount is required"],
        index:true
   } ,

  
   
   
  
   status:{
    type:String ,
    enum:{
        values:["Pending","Completed","Failed" ,"Reversed", "flagged"],
    },
    default:"Pending"
   },

   amount:{
     type:Number,
        required:[true,"amount is required"],
        min:0
   },

   fraudScore: { type: Number, min: 0, max: 1 },
   fraudReasons: [{ type: String }],
   isFraud: { type: Boolean, default: false },
   anomalyScore: { type: Number },
   isAnomaly: { type: Boolean, default: false },
   processedAt: { type: Date },
   referenceId: { type: String },

   idempotencykey:{
    type:String,
    required:[true,"idempotencykey is required"],
    unique:true
   }
  } , 
  {
    timestamps:true
  })
   const transactionmodel= mongoose.model("transaction",transactionschema);
   module.exports= transactionmodel;