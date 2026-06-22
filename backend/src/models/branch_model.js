const mongoose = require("mongoose");
const countermodel = require("./counter_model");
const employee = require("./employe_model");
const ledgermodel = require("./ledger");

const branchschema = new mongoose.Schema({

    branchName: {
        type: String,
        required: [true, "Branch name is required"],
        unique: true
    },
    branchPhone: {
        type: String,
        required: [true, "Branch phone number is required"],
        unique: true 
    },  
    branchEmail: {
        type: String,
        required: [true, "Branch email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    branchAccount:{
        type: String,
        required: true,
        unique: true    
    },

    branchCode: {
        type: String,
        required: [true, "Branch code is required"],        
        unique: true
    },
    address: {
        type: String,
        required: [true, "Branch address is required"]
    },  
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Closed"]  
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    employee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee"
    } ,
   

});


// Auto-increment logic for Branch Code 
branchschema.pre("validate", async function () {
    if (this.isNew && !this.branchCode) {
        const counter = await countermodel.findOneAndUpdate(
            { _id: 'branch_code' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        this.branchCode = "SBIN" + String(counter.seq).padStart(7, '0');
    }
});

branchschema.pre("validate", async function () {
    if (this.isNew && !this.branchAccount) {
        const counter = await countermodel.findOneAndUpdate(
            { _id: 'branch_account' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        this.branchAccount = "BRN" + String(counter.seq).padStart(11, '0');
    }
});


branchschema.methods.getbalance = async function(){

 const  result = await ledgermodel.aggregate([

 {
    $match:{
        account: this.branchAccount
    }

 } ,

 {
    $group:{
        _id:null,
        totaldebit:{
            $sum:{
                $cond:[
                    {$eq:["$type","debit"]},
                    "$amount",
                    0
                ]
            
            }
        }  ,
         totalcredit:{
            $sum:{
                $cond:[
                    {$eq:["$type","credit"]},
                    "$amount",
                    0
                ]
            
            }
        } 

    }

 } ,
 {
    $project:{
        _id:0,
        balance:{
            $subtract:["$totalcredit","$totaldebit"]
        }
    }
 }

 ]);


 // Example value: [ { balance: 1000 } ]
 // Return the calculated balance, or 0 if no transactions found
 return result.length > 0 ? result[0].balance : 0;
}


const Branch = mongoose.model("Branch", branchschema);
module.exports = Branch;
