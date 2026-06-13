const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document automatically deletes after 10 minutes
    }
});

const otpmodel = mongoose.model("otp", otpSchema);
module.exports = otpmodel;