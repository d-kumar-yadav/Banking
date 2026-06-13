import pandas as pd
 
df= pd.read_csv("data/PS_20174392719_1491204439457_log.csv" , nrows=500000)  # reduce to 500k rows 
df = df.rename(columns={
    'oldbalanceOrg': 'sender_old_balance',
    'newbalanceOrig': 'sender_new_balance',
    'oldbalanceDest': 'receiver_old_balance',
    'newbalanceDest': 'receiver_new_balance',
})


columns_to_keep=[
    "amount",
    "sender_old_balance",
    "sender_new_balance",
    "receiver_old_balance",
    "receiver_new_balance",
    "isFraud",
    
]
df= df[columns_to_keep]  # keep only the relevant columns
df.to_csv("data/fraud_data.csv", index=False)  # save the cleaned data for training the model
print("data is compressed and saved to data/fraud_data.csv")