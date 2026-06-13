const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // E.g., "loan_id , account_number , refrence number "
    seq: { type: Number, default: 0 } // Starting number
});

const countermodel = mongoose.model("counter", counterSchema);
module.exports = countermodel;