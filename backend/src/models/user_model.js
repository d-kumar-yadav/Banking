const mongoose= require("mongoose");
const bcrypt= require("bcryptjs");
const Branch  = require(  "./branch_model");

const userschema = new mongoose.Schema({

  email:{
     type:String,
     required:[true,"email is required"],
     unique:true,
     lowercase:true,
     trim:true,
     match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"please fill a valid email address"]
  },
  name:{
    type:String,
    required:[true,"name is required"],
  },
   password:{
    type:String,
    required:[true,"password is required"],
    minlength:[6, "password must be at least 6 characters long"],
    select : false
   }  ,
   phone: { 
    type: String,
    default:"8809988789",
    unique: true,
    match: [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, "Please fill a valid phone number"],
    select: false
   },
   
   role: { type: String, enum: ['customer'], default: 'customer' },
   
   kycStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
 
   creditScore: { type: Number , default: 450 , select: false ,min: 300, max: 950 },

   

   monthlyIncome: { type: Number, default: 20000, min: 0, select: false },
   gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
   
      date_of_birth: { type: Date, select: false ,default: new Date('1990-01-01')},
lastLogin :{
     type:Date,
} ,

   adhar_id: {
       type: String,
       unique: true,
       sparse: true, // Allows field to be null initially without triggering unique constraint
       match: [/^\d{12}$/, "Aadhaar ID must be exactly 12 digits"],
       select: false
   },
   pan_id: {
       type: String,
       unique: true,
       sparse: true,
       match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please fill a valid PAN ID"],
       select: false
   },
   address: { type: String },
   image: {
       type: String, // URL of the user's uploaded image
       select: false
   },
   signature: {
       type: String, // URL of the user's uploaded signature
       select: false
   },
   adhar_image: {
       type: String, // URL of the user's uploaded Aadhaar image
       select: false
   },
   pan_image: {
       type: String, // URL of the user's uploaded PAN image
       select: false
   },
   branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }


  
  } ,
   
   {

     timestamps:true ,  

})
// i  can also intalize inside  the controoler 
userschema.pre("save" , async function(){
  if(!this.isModified("password")){
    return ;
  }   

  const hash= await bcrypt.hash(this.password,10);
  this.password=hash;
  return;
})

userschema.methods.comparePassword= async function (password){
  return await bcrypt.compare(password ,this.password);
}

const usermodel = mongoose.model("user",userschema);
module.exports= usermodel;