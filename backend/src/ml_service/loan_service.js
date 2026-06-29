const  usermodel = require("../models/user_model");
const accountmodel = require("../models/account_model");
const loanmodel = require("../models/loan_model");
const axios = require("axios");
require("dotenv").config();

exports.defaultprobablity = async (features) =>{

    try{

        const baseurl= process.env.ML_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(`${baseurl}/predict_default`, features, { timeout: 30000 }); 

        return {
            defaultProbability: response.data.default_probability
        };

    }
    catch(err){
        console.log("Error in defaultprobablity service", err);
       return {defaultProbability: 0}; // Fallback to 0 if ML service fails
    }


}
