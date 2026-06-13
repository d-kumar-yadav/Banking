import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Load your dataset
df = pd.read_csv('data/loan_dataset_20000.csv')
print("Data loaded successfully!")
# 2. Select your 12 Features + Target
features = [
    'age', 'gender', 'marital_status', 'education_level', 
    'annual_income', 'monthly_income', 'employment_status', 
    'debt_to_income_ratio', 'credit_score', 'loan_amount', 
    'loan_purpose', 'total_credit_limit'
]
target = 'loan_paid_back'

X = df[features].copy()
y = df[target]

# 3. Categorical Encoding (Convert Text to Numbers)
encoders = {}
categorical_cols = ['gender', 'marital_status', 'education_level', 'employment_status', 'loan_purpose']

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le

# 4. Train the Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Save the Model and Encoders
joblib.dump(model, 'loan_model.pkl')
joblib.dump(encoders, 'loan_encoders.pkl')

print("Model trained and saved successfully!")