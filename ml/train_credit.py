import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from imblearn.over_sampling import SMOTE
import joblib

print("Loading data...")


df = pd.read_csv('data/cs-training.csv').fillna(0)
df = df.rename(columns={
    'RevolvingUtilizationOfUnsecuredLines': 'utilization',
    'DebtRatio': 'debt_ratio',
    'MonthlyIncome': 'income',
    'SeriousDlqin2yrs': 'is_default'
})

# 
features = [
    
    'utilization',
    'age', 
    'debt_ratio',
    'income',
   
]

X = df[features]
y = df['is_default'] # 1 = Default Risk, 0 = Safe

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Applying SMOTE to balance classes...")
sm = SMOTE(random_state=42)
X_train_res, y_train_res = sm.fit_resample(X_train, y_train)

print("Training model...")
# Using Random Forest Classifier to get probability scores later
model = RandomForestClassifier(
    n_estimators=100, 
    max_depth=10, # Limiting depth prevents overfitting for the simulator
    random_state=42, 
    n_jobs=-1 # Uses all CPU cores for faster training
)
model.fit(X_train_res, y_train_res)

print("Evaluating model...")

probs = model.predict_proba(X_test)[:, 1]  # check probability of being in class 1 (default risk)
auc_score = roc_auc_score(y_test, probs)  
print(f"AUC Score: {auc_score:.3f}")

# Save the model
joblib.dump(model, 'credit_model.pkl')
print("Model saved as credit_model.pkl")