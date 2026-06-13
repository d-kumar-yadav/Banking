const mongoose = require("mongoose");
const countermodel = require("./counter_model");

const loanschema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    loan_id: { type: String, unique: true, required: true },

    // data we get from user model and account model at the time of loan application
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    totalCreditLimit: { type: Number, required: true }, // From Account Model
    creditScoreAtApplication: { type: Number, required: true },

    // DATA COLLECTED FROM THE LOAN FORM 
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced"], required: true },
    educationLevel: { type: String, enum: ["High School", "Bachelor", "Master", "PhD"], required: true },
    employmentStatus: { type: String, enum: ["Employed", "Self-Employed", "Unemployed"], required: true },
    annualIncome: { type: Number, required: true }, // Calculated as monthly * 12 or user input
    loanAmount: { type: Number, required: true },
    loanPurpose: { type: String, enum: ["Personal", "Home", "Education", "Automobile", "Medical"], required: true },
    loanTerm: { type: Number, required: true }, // in months
    debtToIncomeRatio: { type: Number, required: true }, // Calculated field

    //  ML & SYSTEM FIELDS 
    defaultProbability: { type: Number, default: 0 }, 
    status: { 
        type: String, 
        enum: ["Applied", "Review_Required", "Approved", "Rejected", "Disbursed"], 
        default: "Applied" 
    },
    adminRemarks: { type: String }

}, { timestamps: true });

// Auto-increment logic for Loan ID (LN10001...)
loanschema.pre("validate", async function (next) {
    if (this.isNew && !this.loan_id) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'loan_id' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.loan_id = "LN" + counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const loanmodel = mongoose.model("loan", loanschema);
module.exports = loanmodel;