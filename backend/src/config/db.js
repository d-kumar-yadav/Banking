 const mongoose= require("mongoose");
 require("dotenv").config();
  function connecttodb(){
    mongoose.connect(process.env.DATABASE_URL)
    .then (()=>{
        console.log("connected to datbase")
    })
    .catch ((err)=>{
        console.log("error connecting to database",err)
    })
  }
  module.exports=connecttodb;