import pandas as pd
import torch
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score, precision_score, recall_score
import warnings
warnings.filterwarnings('ignore')
from fastapi import FastAPI, UploadFile, File
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Healthcare Deterioration Prediction API")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["https://your-frontend.com"]
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "Healthcare Deterioration Prediction API is running 🚑"}





# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

class HealthcareDataset(Dataset):
    """Custom dataset for healthcare time series data"""
    def __init__(self, X, y):
        self.X = torch.FloatTensor(X)
        self.y = torch.FloatTensor(y)
    
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class MultiTaskLSTM(nn.Module):
    """Multi-task LSTM model for healthcare deterioration prediction"""
    def __init__(self, input_size, lstm_hidden_sizes=[128, 64, 32], 
                 dense_sizes=[64, 32], n_targets=4, dropout=0.2):
        super(MultiTaskLSTM, self).__init__()
        
        self.input_size = input_size
        self.n_targets = n_targets
        self.target_names = [
            'diabetes_90d_deterioration',
            'obesity_90d_deterioration', 
            'heart_failure_90d_deterioration',
            'kidney_failure_90d_deterioration'
        ]
        
        # LSTM layers
        self.lstm_layers = nn.ModuleList()
        prev_size = input_size
        
        for i, hidden_size in enumerate(lstm_hidden_sizes):
            return_sequences = i < len(lstm_hidden_sizes) - 1
            self.lstm_layers.append(
                nn.LSTM(prev_size, hidden_size, batch_first=True, dropout=dropout if i > 0 else 0)
            )
            prev_size = hidden_size
        
        # Shared dense layers
        self.shared_layers = nn.ModuleList()
        prev_size = lstm_hidden_sizes[-1]
        
        for dense_size in dense_sizes:
            self.shared_layers.append(nn.Linear(prev_size, dense_size))
            self.shared_layers.append(nn.ReLU())
            self.shared_layers.append(nn.Dropout(dropout))
            prev_size = dense_size
        
        # Individual output heads for each target
        self.output_heads = nn.ModuleDict()
        for i, target_name in enumerate(self.target_names):
            self.output_heads[target_name] = nn.Sequential(
                nn.Linear(prev_size, 16),
                nn.ReLU(),
                nn.Linear(16, 1),
                nn.Sigmoid()
            )
    
    def forward(self, x):
        # Pass through LSTM layers
        lstm_out = x
        
        for i, lstm_layer in enumerate(self.lstm_layers):
            lstm_out, (h_n, c_n) = lstm_layer(lstm_out)
            if i < len(self.lstm_layers) - 1:
                # Apply dropout between LSTM layers (except last)
                lstm_out = nn.Dropout(0.2)(lstm_out)
        
        # Use the last time step output
        lstm_out = lstm_out[:, -1, :]  # (batch_size, hidden_size)
        
        # Pass through shared layers
        shared_out = lstm_out
        for layer in self.shared_layers:
            shared_out = layer(shared_out)
        
        # Generate outputs for each target
        outputs = {}
        for target_name, head in self.output_heads.items():
            outputs[target_name] = head(shared_out)
        
        return outputs

class HealthcareDeteriorationPredictor:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.scalers = {}
        self.label_encoders = {}
        self.model = None
        self.scaler = None
        self.feature_columns = []
        self.target_columns = [
            'diabetes_90d_deterioration',
            'obesity_90d_deterioration', 
            'heart_failure_90d_deterioration',
            'kidney_failure_90d_deterioration'
        ]
        self.device = device
        
    def preprocess_data(self, df):
        """Comprehensive data preprocessing for temporal healthcare data"""
        print("Starting data preprocessing...")
        
        # Clean column names and handle special characters
        df.columns = [col.replace('*', '').replace('**', '') for col in df.columns]
        
        # Define feature categories
        numerical_features = [
            'day_index', 'age', 'bmi_baseline', 'height_cm', 'weight_kg',
            'systolic_bp', 'diastolic_bp', 'heart_rate', 'respiratory_rate',
            'temperature_c', 'oxygen_saturation', 'hba1c', 'fasting_glucose',
            'glucose_random', 'cholesterol_total', 'ldl', 'hdl', 'triglycerides',
            'creatinine', 'egfr', 'bun', 'c_reactive_protein', 'nt_proBNP',
            'bnP_approx', 'hemoglobin', 'wbc_count', 'platelet_count', 'alt', 'ast',
            'medication_count', 'adherence_rate', 'daily_steps', 'exercise_minutes',
            'sleep_hours', 'stress_level', 'water_intake_liters', 'screen_time_hours',
            'mental_health_score', 'bp_variability_7d', 'glucose_variability_7d',
            'weight_change_30d', 'bmi_trend', 'adherence_trend'
        ]
        
        categorical_features = [
            'sex', 'ethnicity', 'blood_type', 'family_history', 'insulin_use',
            'metformin_use', 'antihypertensive_use', 'statin_use', 'ace_inhibitor_use',
            'diuretic_use', 'beta_blocker_use', 'antiplatelet_use', 'diet_type',
            'exercise_level', 'smoking_status', 'alcohol_use', 'hypertension',
            'coronary_artery_disease', 'chronic_kidney_disease', 'prior_stroke', 'copd_flag'
        ]
        
        # Handle missing values
        for col in numerical_features:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].fillna(df[col].median())
        
        for col in categorical_features:
            if col in df.columns:
                df[col] = df[col].fillna('unknown')
        
        # Encode categorical variables
        categorical_encoded = []
        for col in categorical_features:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col])
                else:
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col])
                categorical_encoded.append(f'{col}_encoded')
        
        # Combine all feature columns
        available_numerical = [col for col in numerical_features if col in df.columns]
        self.feature_columns = available_numerical + categorical_encoded
        
        print(f"Processed {len(self.feature_columns)} features")
        return df
    
    def create_sequences(self, df):
        """Create time sequences for LSTM input"""
        print("Creating time sequences...")
        
        sequences = []
        targets = []
        
        # Group by patient
        for patient_id in df['patient_id'].unique():
            patient_data = df[df['patient_id'] == patient_id].sort_values('day_index')
            
            if len(patient_data) >= self.sequence_length:
                # Extract features and targets
                feature_data = patient_data[self.feature_columns].values
                target_data = patient_data[self.target_columns].iloc[-1].values  # Use last day's targets
                
                # Create sequence (use all available days, pad if necessary)
                if len(feature_data) == self.sequence_length:
                    sequences.append(feature_data)
                    targets.append(target_data)
                elif len(feature_data) > self.sequence_length:
                    # Use last 60 days
                    sequences.append(feature_data[-self.sequence_length:])
                    targets.append(target_data)
        
        X = np.array(sequences)
        y = np.array(targets)
        
        print(f"Created {len(X)} sequences of shape {X.shape}")
        return X, y
    
    def scale_features(self, X_train, X_test):
        """Scale numerical features"""
        print("Scaling features...")
        
        # Reshape for scaling (flatten time dimension)
        X_train_reshaped = X_train.reshape(-1, X_train.shape[-1])
        X_test_reshaped = X_test.reshape(-1, X_test.shape[-1])
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_reshaped)
        X_test_scaled = self.scaler.transform(X_test_reshaped)
        
        # Reshape back to sequences
        X_train_scaled = X_train_scaled.reshape(X_train.shape)
        X_test_scaled = X_test_scaled.reshape(X_test.shape)
        
        return X_train_scaled, X_test_scaled
    
    def train_epoch(self, model, dataloader, criterion_dict, optimizer, device):
        """Train for one epoch"""
        model.train()
        total_loss = 0
        total_samples = 0
        
        for batch_X, batch_y in dataloader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(batch_X)
            
            # Calculate loss for each target
            total_batch_loss = 0
            for i, target_name in enumerate(self.target_columns):
                target_loss = criterion_dict[target_name](
                    outputs[target_name].squeeze(), 
                    batch_y[:, i]
                )
                total_batch_loss += target_loss
            
            # Backward pass
            total_batch_loss.backward()
            optimizer.step()
            
            total_loss += total_batch_loss.item()
            total_samples += batch_X.size(0)
        
        return total_loss / len(dataloader)
    
    def evaluate_epoch(self, model, dataloader, criterion_dict, device):
        """Evaluate for one epoch"""
        model.eval()
        total_loss = 0
        predictions = {target: [] for target in self.target_columns}
        actuals = {target: [] for target in self.target_columns}
        
        with torch.no_grad():
            for batch_X, batch_y in dataloader:
                batch_X, batch_y = batch_X.to(device), batch_y.to(device)
                
                # Forward pass
                outputs = model(batch_X)
                
                # Calculate loss
                total_batch_loss = 0
                for i, target_name in enumerate(self.target_columns):
                    target_loss = criterion_dict[target_name](
                        outputs[target_name].squeeze(), 
                        batch_y[:, i]
                    )
                    total_batch_loss += target_loss
                    
                    # Store predictions and actuals
                    predictions[target_name].extend(outputs[target_name].squeeze().cpu().numpy())
                    actuals[target_name].extend(batch_y[:, i].cpu().numpy())
                
                total_loss += total_batch_loss.item()
        
        return total_loss / len(dataloader), predictions, actuals
    
    def train(self, df, validation_split=0.2, epochs=100, batch_size=32, learning_rate=0.001):
        """Train the model"""
        print("Starting model training...")
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Create sequences
        X, y = self.create_sequences(df_processed)
        
        if len(X) == 0:
            raise ValueError("No valid sequences created. Check your data format.")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=validation_split, random_state=42, stratify=y[:, 0]
        )
        
        # Scale features
        X_train_scaled, X_test_scaled = self.scale_features(X_train, X_test)
        
        # Create datasets and dataloaders
        train_dataset = HealthcareDataset(X_train_scaled, y_train)
        test_dataset = HealthcareDataset(X_test_scaled, y_test)
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
        
        # Initialize model
        input_size = X_train_scaled.shape[2]
        self.model = MultiTaskLSTM(input_size=input_size, n_targets=len(self.target_columns))
        self.model.to(self.device)
        
        # Loss functions and optimizer
        criterion_dict = {target: nn.BCELoss() for target in self.target_columns}
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=10, factor=0.5)
        
        # Training loop
        train_losses = []
        val_losses = []
        best_val_loss = float('inf')
        patience_counter = 0
        patience = 15
        
        print(f"Training on {len(X_train_scaled)} samples, validating on {len(X_test_scaled)} samples")
        
        for epoch in range(epochs):
            # Training
            train_loss = self.train_epoch(self.model, train_loader, criterion_dict, optimizer, self.device)
            
            # Validation
            val_loss, val_predictions, val_actuals = self.evaluate_epoch(
                self.model, test_loader, criterion_dict, self.device
            )
            
            # Learning rate scheduling
            scheduler.step(val_loss)
            
            # Store losses
            train_losses.append(train_loss)
            val_losses.append(val_loss)
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                # Save best model
                torch.save(self.model.state_dict(), 'best_model.pth')
            else:
                patience_counter += 1
                
            if patience_counter >= patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
            
            # Print progress
            if (epoch + 1) % 10 == 0:
                print(f'Epoch [{epoch+1}/{epochs}], Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}')
        
        # Load best model
        self.model.load_state_dict(torch.load('best_model.pth'))
        
        # Final evaluation
        final_val_loss, final_predictions, final_actuals = self.evaluate_epoch(
            self.model, test_loader, criterion_dict, self.device
        )
        
        self.evaluate_model(final_predictions, final_actuals)
        
        return {'train_losses': train_losses, 'val_losses': val_losses}
    
    def evaluate_model(self, predictions, actuals):
        """Evaluate model performance"""
        print("\n" + "="*50)
        print("MODEL EVALUATION")
        print("="*50)
        
        # Evaluate each target
        for target in self.target_columns:
            y_true = np.array(actuals[target])
            y_pred = np.array(predictions[target])
            y_pred_binary = (y_pred > 0.5).astype(int)
            
            print(f"\n{target.upper()}:")
            print("-" * 30)
            
            # AUC Score
            try:
                auc = roc_auc_score(y_true, y_pred)
                print(f"AUC-ROC: {auc:.4f}")
            except:
                print("AUC-ROC: Unable to calculate")
            
            # Other metrics
            accuracy = accuracy_score(y_true, y_pred_binary)
            precision = precision_score(y_true, y_pred_binary, zero_division=0)
            recall = recall_score(y_true, y_pred_binary, zero_division=0)
            
            print(f"Accuracy: {accuracy:.4f}")
            print(f"Precision: {precision:.4f}")
            print(f"Recall: {recall:.4f}")
            
            # Classification report
            print("\nClassification Report:")
            print(classification_report(y_true, y_pred_binary, zero_division=0))
    
    def predict(self, df):
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model not trained yet. Call train() first.")
        
        self.model.eval()
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Create sequences
        X, _ = self.create_sequences(df_processed)
        
        if len(X) == 0:
            print("Warning: No valid sequences for prediction")
            return None
        
        # Scale features
        X_scaled = self.scaler.transform(X.reshape(-1, X.shape[-1]))
        X_scaled = X_scaled.reshape(X.shape)
        
        # Convert to tensor
        X_tensor = torch.FloatTensor(X_scaled).to(self.device)
        
        # Make predictions
        with torch.no_grad():
            outputs = self.model(X_tensor)
        
        # Format results
        results = {}
        for target_name in self.target_columns:
            preds = outputs[target_name].squeeze().cpu().numpy()
            if preds.ndim == 0:  # scalar → wrap it
                preds = np.array([preds])
            results[target_name] = preds
        
        return pd.DataFrame(results)

    
    def save_model(self, filepath):
        """Save the trained model"""
        if self.model is not None:
            torch.save({
                'model_state_dict': self.model.state_dict(),
                'scaler': self.scaler,
                'label_encoders': self.label_encoders,
                'feature_columns': self.feature_columns,
                'target_columns': self.target_columns,
                'sequence_length': self.sequence_length
            }, filepath)
            print(f"Model saved to {filepath}")
    
    def load_model(self, filepath, input_size):
        """Load a pre-trained model"""
        checkpoint = torch.load(filepath, map_location=self.device, weights_only=False)
        
        # Restore preprocessing objects
        self.scaler = checkpoint['scaler']
        self.label_encoders = checkpoint['label_encoders']
        self.feature_columns = checkpoint['feature_columns']
        self.target_columns = checkpoint['target_columns']
        self.sequence_length = checkpoint['sequence_length']
        
        # Initialize and load model
        self.model = MultiTaskLSTM(input_size=input_size, n_targets=len(self.target_columns))
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        print(f"Model loaded from {filepath}")



# Import your predictor class
# from your_module import HealthcareDeteriorationPredictor, MultiTaskLSTM  # adjust the import path

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the CSV file (replace with your test/new data file path)
data_path = "test_data.csv"   # <-- replace with your dataset file
df = pd.read_csv(data_path)

# Initialize predictor (sequence_length must match what you trained with)
predictor = HealthcareDeteriorationPredictor(sequence_length=60)

# Load the trained model checkpoint
# NOTE: input_size must match your training feature dimension
checkpoint = torch.load("healthcare_deterioration_pytorch_model.pth", map_location=device, weights_only=False)
input_size = len(checkpoint['feature_columns'])
predictor.load_model("healthcare_deterioration_pytorch_model.pth", input_size=input_size)

# Run predictions on new dataset
predictions = predictor.predict(df)

# Show results
if predictions is not None:
    print("\nPredictions:")
    print(predictions.head())

    # Example: save predictions to CSV
    predictions.to_csv("predictions.csv", index=False)
    print("Predictions saved to predictions.csv")



@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a CSV file with patient data and get predictions.
    """
    # Read uploaded file into pandas DataFrame
    contents = await file.read()
    df = pd.read_csv(BytesIO(contents))

    # Run predictions
    predictions = predictor.predict(df)

    if predictions is None:
        return {"error": "No valid sequences for prediction"}
    
    return predictions.to_dict(orient="records")