const mongoose = require("mongoose");
const countermodel = require("./counter_model");

const referenceloanschema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    reference_number: { type: String, unique: true, required: true },

    age: { type: Number, required: true },
    gender: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    totalCreditLimit: { type: Number, required: true },
    creditScoreAtApplication: { type: Number, required: true },

    maritalStatus: { type: String, enum: ["Divorced", "Married", "Single", "Widowed"], required: true },
    educationLevel: { type: String, enum: ["Bachelor's", "High School", "Master's", "Other", "PhD"], required: true },
    employmentStatus: { type: String, enum: ["Employed", "Retired", "Self-employed", "Student", "Unemployed"], required: true },
    annualIncome: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    loanPurpose: { type: String, enum: ["Business", "Car", "Debt consolidation", "Education", "Home", "Medical", "Other", "Vacation"], required: true },
    loanTerm: { type: Number, required: true },
    debtToIncomeRatio: { type: Number, required: true },

    defaultProbability: { type: Number, default: 0 }, 
    status: { 
        type: String, 
        enum: ["Review_Required", "Rejected"], 
        default: "Review_Required" 
    },
    adminRemarks: { type: String }

}, { timestamps: true });

// Auto-increment logic for Reference Number (LREF-0000001)
referenceloanschema.pre("validate", async function () {
    if (this.isNew && !this.reference_number) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'loan_reference_number' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.reference_number = "LNREF" + String(counter.seq).padStart(10, '0');
        } catch (error) {
            console.error("Error in reference loan counter update:", error);
            throw error;
        }
    }
});

const referenceloanmodel = mongoose.model("referenceloan", referenceloanschema);
module.exports = referenceloanmodel;
