const mongoose= require("mongoose");
 
const ledgerschema= new mongoose.Schema({

    account:{
     type: String,
        required:[ true,"account is required"],
        index:true
   },
    amount:{
        type:Number,
        required:[true,"amount is required"],
        immutable:true

    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:true,
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["debit","credit"],
            message:"type must be either debit or credit"
         },
         required:true,
         immutable:true
        },
    createdAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }
} , {timestamps:true})


function modificationledger(){
    throw new Error("Ledger entries cannot be modified - Immutable collection")
}

ledgerschema.pre("findOneAndUpdate",modificationledger);
ledgerschema.pre("updateOne",modificationledger);
ledgerschema.pre("updateMany",modificationledger);
ledgerschema.pre("replaceOne",modificationledger);
ledgerschema.pre("deleteOne",modificationledger);
ledgerschema.pre("deleteMany",modificationledger);
ledgerschema.pre("remove",modificationledger);
ledgerschema.pre("findOneAndDelete",modificationledger);
ledgerschema.pre("findOneAndRemove",modificationledger);
ledgerschema.pre("findOneAndReplace",modificationledger);
ledgerschema.pre("insertMany",modificationledger);




const ledgermodel= mongoose.model("ledger" ,ledgerschema);
module.exports= ledgermodel;

