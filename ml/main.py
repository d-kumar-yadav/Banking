from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import joblib
import random
import asyncio
from datetime import datetime



app = FastAPI(title="AI Banking ML Service")
# it cereate insatnce  which we can see at 8000

# Enable CORS so your frontend and Swagger UI can reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # Allows all origins , from any website ,from anywhere
    allow_credentials=True,   # allows 
    allow_methods=["*"],    # allow 
    allow_headers=["*"],       # allow 
) 




# load pretrained model , it loadd only once when server start
fraud_model = joblib.load("fraud_model.pkl") 

#  credit simulator model
credit_model = joblib.load("credit_model.pkl")

# loan model
loan_model = joblib.load("loan_model.pkl")
loan_encoders = joblib.load("loan_encoders.pkl")

#  when node js send request fast api will check if json body match or not
# if not then it will give error  

class TransactionFeatures(BaseModel):
    
    amount: float
    sender_old_balance: float = 0.0
    sender_new_balance: float = 0.0
    receiver_old_balance: float = 0.0
    receiver_new_balance: float = 0.0
    


@app.post("/fraud_transaction")
async def score_transaction(tx: TransactionFeatures):
    
    # make a 2d array of features matching the exact order expected by the new model
    features = [[tx.amount, tx.sender_old_balance, tx.sender_new_balance, tx.receiver_old_balance, tx.receiver_new_balance]]

    prob = fraud_model.predict_proba(features)[0][1]
    print(f"ML raw prediction: {prob:.3f}")
    
    

    print(f"FINAL: score={round(float(prob), 3)}, risk={ 'HIGH' if prob > 0.7 else 'MEDIUM' if prob > 0.4 else 'LOW' }")
    return {
        "fraud_score": round(float(prob), 3),
        "risk_level": "HIGH" if prob > 0.7 else "MEDIUM" if prob > 0.4 else "LOW",
       
    }
    
    

class SimulationData(BaseModel):
    utilization: float
    age: int
    debt_ratio: float
    income: float
    
    current_score: int
   

@app.post("/simulate")
async def simulate_score(data: SimulationData):
    # Predict probability of default (0.0 to 1.0)
    features = [[data.utilization, data.age, data.debt_ratio, data.income]]
    prob_default = credit_model.predict_proba(features)[0][1]
    
    hypothetical_score = int(850 - (prob_default * 550)) 
    # make sure it is bteween 300 and 950
    hypothetical_score = max(300, min(950, hypothetical_score))
   
    impact = hypothetical_score - data.current_score
    
    return  {
        "current_score": data.current_score,
        "predicted_score": hypothetical_score,
        "impact": impact, # e.g., -30 or +15
        "status": "decrease" if impact < 0 else "increase"
    }
    
    
    
class loanapplicationdata(BaseModel):
    age:int
    gender:str
    marital_status:str
    education_level:str
    annual_income:int
    monthly_income:int
    employment_status:str
    debt_to_income_ratio:float
    credit_score:int
    loan_amount:int
    loan_purpose:str
    total_credit_limit:int

@app.post("/predict_default")
async def predict_default(data: loanapplicationdata):  
    # encode categorical features using the same encoders used during training
    encoded_data = data.dict()
    for col in loan_encoders:
        le = loan_encoders[col]
        encoded_data[col] = le.transform([encoded_data[col]])[0]
    
    features = [[
        data.age,
        encoded_data['gender'],
        encoded_data['marital_status'],
        encoded_data['education_level'],
        data.annual_income,
        data.monthly_income,        
        encoded_data['employment_status'],
        data.debt_to_income_ratio,
        data.credit_score,
        data.loan_amount,    
        encoded_data['loan_purpose'],
        data.total_credit_limit
    ]]
    
    prob_default = loan_model.predict_proba(features)[0][0]
    return {
        "default_probability": round(float(prob_default), 3),
        "risk_level": "HIGH" if prob_default > 0.7 else "MEDIUM" if prob_default > 0.4 else "LOW",
    }       
    
    
    
# for settlement simulation
from fastapi import HTTPException


EXTERNAL_BANKS = {
    "SBI": {"status": "ONLINE", "latency": 0.5},
    "HDFC": {"status": "MAINTENANCE", "latency": 2.0},
    "ICICI": {"status": "ONLINE", "latency": 0.2}
}

@app.post("/central_hub_v2/settle")
async def central_hub_settle(payload: dict):
    # 1. Identify Destination Bank from IFSC or Account Prefix
    dest_bank_code = payload.get("bank_code", "UNKNOWN")
    
    if dest_bank_code not in EXTERNAL_BANKS:
        return {"status": "REJECTED", "reason": "Invalid Bank Identifier"}

    bank_meta = EXTERNAL_BANKS[dest_bank_code]

    # 2. Check if the Destination Bank is actually "up"
    if bank_meta["status"] == "MAINTENANCE":
        return {"status": "FAILED", "reason": f"{dest_bank_code} systems are currently down."}

    # 3. Simulate Network Latency (The "Handshake")
    await asyncio.sleep(bank_meta["latency"])

    # 4. Generate a unique "RRN" (Retrieval Reference Number) used in UPI/IMPS
    rrn = f"{datetime.now().strftime('%Y%m%d')}{random.randint(100000, 999999)}"

    return {
        "status": "SUCCESS",
        "rrn": rrn,
        "cleared_at": datetime.now().isoformat(),
        "beneficiary_name": "External User" # In reality, the other bank sends this back
    }

    
if __name__ == "__main__":    
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
