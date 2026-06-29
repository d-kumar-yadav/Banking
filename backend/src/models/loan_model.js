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
    maritalStatus: { type: String, enum: ["Divorced", "Married", "Single", "Widowed"], required: true },
    educationLevel: { type: String, enum: ["Bachelor's", "High School", "Master's", "Other", "PhD"], required: true },
    employmentStatus: { type: String, enum: ["Employed", "Retired", "Self-employed", "Student", "Unemployed"], required: true },
    annualIncome: { type: Number, required: true }, // Calculated as monthly * 12 or user input
    loanAmount: { type: Number, required: true },
    loanPurpose: { type: String, enum: ["Business", "Car", "Debt consolidation", "Education", "Home", "Medical", "Other", "Vacation"], required: true },
    loanTerm: { type: Number, required: true }, // in months
    debtToIncomeRatio: { type: Number, required: true }, // Calculated field

    //  ML & SYSTEM FIELDS 
    defaultProbability: { type: Number, default: 0 }, 
    status: { 
        type: String, 
        enum: ["Applied", "Review_Required", "Approved", "Rejected", "Disbursed", "Active", "Closed", "Defaulted"], 
        default: "Applied" 
    },
    adminRemarks: { type: String },
    
    // LOAN REPAYMENT FIELDS
    interestRate: { type: Number, default: 10 }, // Default 10% annual
    totalRepaymentAmount: { type: Number }, // Principal + Interest
    remainingBalance: { type: Number },
    monthlyEMI: { type: Number },
    nextDueDate: { type: Date }

}, { timestamps: true });

// Auto-increment logic for Loan ID (LN10001...)
loanschema.pre("validate", async function () {
    if (this.isNew && !this.loan_id) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'loan_id' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.loan_id = "LN" + String(counter.seq).padStart(8, '0');
            
        } catch (error) {
            console.error("Error in counter update:", error);
         
          throw error;
        }
    }
});

const loanmodel = mongoose.model("loan", loanschema);
module.exports = loanmodel;