 const mongoose= require("mongoose");
 const ledgermodel= require("./ledger");
 const countermodel = require("./counter_model");
 const Branch = require("./branch_model");

 const accountschema= new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        unique:true,
        // index :true 
        // for faster query performance when filtering by user but i have already created compound index
    },
   
    status:{
        type: String,
        default: "Active",
        enum: {
            values: ["Active", "Frozen", "Closed"],
            message: "Status must be either Active, Frozen, or Closed",
            
        },
        
    },

    account_type:{
        type:String,
        required:[true, "account type is required"],
        default:"Savings",
        enum:{
            values:["Savings","Current"],
        }

    },

    accountNumber: {
        type: String,
        unique: true,
        immutable: true // Once generated, the account number can never be changed
    },

    
    
   
   totalCreditLimit: { type: Number, default: 100000 } ,
    

    currency:{
        type:String,
        required:[true, "currency is required"],
        default:"INR"
    } ,
//The great thing about Mongoose is that when you define an array of objects like cards: [{ ... }], 
// the array itself is completely optional by default.
    cards: [{
        cardNumber: {
            type: String,
            required: true
        },
        cardType: {
            type: String,
            enum: ["debit", "credit"],
            required: true
        },
        expiryDate: {
            type: String, // Format: MM/YY
            required: true
        },
        cvv: {
            type: String,
            required: true
        },
        status: { type: String, enum: ['Active', 'Blocked', 'Expired'], default: 'Active' }
    }],

    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }

 } ,
{
    timestamps:true
})
// Compound index to optimize queries filtering by user and status.
 accountschema.index({user:1 , status:1} ); 

//  check balance
accountschema.methods.getbalance = async function(){

 const  result = await ledgermodel.aggregate([

 {
    $match:{
        account: this.accountNumber
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



// i have used counter collection to generate unique account number in sequence 
// beacuse in generating account number through random generator there is a possiblity of same account number
accountschema.pre("validate", async function () {
    if (this.isNew && !this.accountNumber) {
        // Atomically increment the sequence counter
        const counter = await countermodel.findOneAndUpdate(
            { _id: 'account_number' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true } // Create the counter document if it doesn't exist yet
        );
        
        // Format a 12-digit number: "310" (Bank Code) + 9-digit zero-padded sequence
        
        this.accountNumber = "310" + String(counter.seq).padStart(9, '0');
    }
});

 const accountmodel= mongoose.model("account",accountschema);
 module.exports= accountmodel;