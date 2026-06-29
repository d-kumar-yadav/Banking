const mongoose = require("mongoose");

const referenceCardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",
            required: true,
        },
        cardType: {
            type: String,
            enum: ["debit", "credit"],
            required: true,
        },
        cardName: {
            type: String, // e.g., "Sapphire Reserve", "Ruby Rewards", "Standard Debit"
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        applicationId: {
            type: String,
            unique: true,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate a unique application ID before saving
referenceCardSchema.pre("validate", function () {
    if (this.isNew && !this.applicationId) {
        this.applicationId = "APP-CRD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
});

const referenceCardModel = mongoose.model("reference_card", referenceCardSchema);
module.exports = referenceCardModel;
