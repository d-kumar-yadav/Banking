const axios = require('axios');
const usermodel = require('../models/user_model');
require('dotenv').config();
const accountmodel = require('../models/account_model');

exports.simulateCreditScore = async (req, res) => {
    let simulationData = {};
    try {
        // select beacuse i have set false
        const user = await usermodel.findById(req.user._id)
            .select('+creditScore +date_of_birth +monthlyIncome');
       
            const account = await accountmodel.findOne({user});
            const totalcreditlimit = account ? account.totalCreditLimit : 100000;

        
        const birthYear = user.date_of_birth ? new Date(user.date_of_birth).getFullYear() : 1990;
        const currentYear = new Date().getFullYear();
        let age = currentYear - birthYear;
        if (isNaN(age)) age = 30;

        let utilization = Number(req.body.creditlimit || 0) / (totalcreditlimit || 100000);
        if (isNaN(utilization) || !isFinite(utilization)) utilization = 0;

        let debtratio = Number(req.body.monthlyemi || 0) / (user.monthlyIncome || 1); 
        if (isNaN(debtratio) || !isFinite(debtratio)) debtratio = 0;
    
        simulationData = {
            utilization: utilization, // from frontend slider
            age: Math.round(age),
            debt_ratio: debtratio,   // from frontend slider
            income: Number(user.monthlyIncome) || 0,
            current_score: Math.round(Number(user.creditScore)) || 450 // Uses the default 450 if new
        };

   
        let baseUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
        baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
        const response = await axios.post(`${baseUrl}/simulate`, simulationData);

    
        
     
        // 5. Send results back to frontend 
        return res.status(200).json({
            success: true,
            data: response.data 
            // Contains - current_score, predicted_score, impact, status
        });

    } catch (error) {
        console.error("Credit Simulation Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Credit simulation failed.",
            errorDetail: error.message,
            attemptedUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
            payloadSent: simulationData,
            fastApiError: error.response?.data
        });
    }
};
