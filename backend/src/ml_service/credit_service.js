const axios = require('axios');
const usermodel = require('../models/user_model');
require('dotenv').config();
const accountmodel = require('../models/account_model');

exports.simulateCreditScore = async (req, res) => {
    try {
        // select beacuse i have set false
        const user = await usermodel.findById(req.user._id)
            .select('+creditScore +date_of_birth +monthlyIncome');
       
            const account = await accountmodel.findOne({user});
            const totalcreditlimit = account ? account.totalCreditLimit : 100000;

        
        const birthYear = user.date_of_birth ? new Date(user.date_of_birth).getFullYear() : 1990;
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const utilization = Number(req.body.creditlimit || 0) / totalcreditlimit;
        const debtratio = Number(req.body.monthlyemi || 0) / (user.monthlyIncome || 1); // Avoid division by zero
    
        const simulationData = {
            utilization: utilization, // from frontend slider
            age: age || 30,
            debt_ratio: debtratio,   // from frontend slider
            income: user.monthlyIncome || 0,
            current_score: user.creditScore || 450 // Uses the default 450 if new
        };

   
        let baseUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
        if (baseUrl === 'http://localhost:8000') baseUrl = 'http://127.0.0.1:8000';
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
            attemptedUrl: process.env.FASTAPI_URL || 'http://localhost:8000'
        });
    }
};
