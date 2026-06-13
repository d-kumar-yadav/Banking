const mongoose = require("mongoose");
const countermodel = require("./counter_model");

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
    }

});

// Auto-increment logic for Branch Code 
branchschema.pre("validate", async function (next) {
    if (this.isNew && !this.branchCode) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'branch_code' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.branchCode = "SBIN" + String(counter.seq).padStart(7, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

branchschema.pre("validate", async function (next) {
    if (this.isNew && !this.branchAccount) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'branch_account' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.branchAccount = "BRN" + String(counter.seq).padStart(7, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});



const Branch = mongoose.model("Branch", branchschema);
module.exports = Branch;
