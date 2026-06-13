const axios = require('axios');
 require('dotenv').config();
exports.getFraudScore = async (fraudFeatures) => {
try {
const baseUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";  // ML service URL
const response = await axios.post(
`${baseUrl}/fraud_transaction`,
fraudFeatures,
{ timeout: 30000 }  // Timeout after 30 seconds  , to avoid hanging if ML service is down
);
return response.data;
} catch (error) {
console.error(" Error reaching ML service:", error.message);
// Fallback if ML service is down
return { fraud_score: 0, risk_level: 'LOW' };
}
};
