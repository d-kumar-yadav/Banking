import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from imblearn.over_sampling import SMOTE
import joblib, numpy as np


# Load data 
print("Loading data")
df = pd.read_csv("data/fraud_data.csv") # convert back into pandas data frame and named it as df
df = df.fillna(0) # fill the missing feature withj 0 value beacuse ml alogrithm cannot handle missing data

# define feature on which ml model is going to predict
features = ["amount", "sender_old_balance", "sender_new_balance", "receiver_old_balance", "receiver_new_balance"]
X = df[features]  # create new dataframe x that contain all the feature
y = df["isFraud"]     # create dataframe y that contain only cloumn isfraud

# spliting data 
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Balance classes (apply SMOTE ONLY to the training data)
print("Applying SMOTE to balance classes ")
sm = SMOTE(random_state=42)
X_train_res, y_train_res = sm.fit_resample(X_train, y_train)

# Train
print("Training Random Forest model")
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train_res, y_train_res)  # train the model

# Check quality
print("Evaluating model")
score = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
# model.predict+_proba give output for each row like [0.9,0.1] 90 % chance of class 0 (not fraud)
# and 10 % chance for class 1 means being fraud  and it take only fraud percentage
#roc_auc_score  this compare agaij actual answer 
print(f"AUC Score: {score:.3f}") # aim for > 0.85

# Save model  to hard drive
joblib.dump(model, "fraud_model.pkl")

print("Model saved to fraud_model.pkl")