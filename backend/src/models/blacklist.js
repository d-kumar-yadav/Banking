const mongoose= require("mongoose");
require("dotenv").config();
 
const blacklistschema= new mongoose.Schema({

   token:{
    type:String,
    required:true,
    unique:true
   } ,

   blacklistschemaAt:{
    type:Date,
    default:Date.now,
   immutable:true
   }



} , {timestamps:true})

//This specific piece of code creates a TTL (Time-To-Live) Index in MongoDB.
//  Its job is to automatically delete documents from your database after a certain amount of time has passed
// This tells MongoDB to create an index on the blacklistschemaAt field (which you defined as a Date). 
// The 1 simply means "sort this index in ascending order".
 blacklistschema.index({ blacklistschemaAt: 1 } , {
    expireAfterSeconds:24*3*60*60
 })

 const blaclistmodel= mongoose.model("blacklist" ,blacklistschema);
 module.exports= blaclistmodel;