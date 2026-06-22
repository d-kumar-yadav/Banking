const mongoose= require("mongoose");
const countermodel = require("./counter_model");

const refernceaccountschema= new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        unique:true,
        index:true
    } ,
    refrencenumber:{
        type: String,
        unique: true,
        required: true,
        immutable: true // Once generated, the reference number can never be changed
    },
    account_type: {
        type: String,
        enum: ["Savings", "Current"],
        default: "Savings",
        required: true
    },
    branchCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
})

// Auto-increment logic for Reference Number
refernceaccountschema.pre("validate", async function () {
    if (this.isNew && !this.refrencenumber) {   
        const counter = await countermodel.findOneAndUpdate(
            { _id: 'refrencenumber' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        
        // Format as "REF-" followed by exactly 7 digits
        this.refrencenumber = "REF-" + String(counter.seq).slice(-7).padStart(7, '0');
    }
});


const refernceaccountmodel= mongoose.model("refernceaccount" ,refernceaccountschema);
module.exports= refernceaccountmodel;