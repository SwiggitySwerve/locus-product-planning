---
name: ml-engineer
description: Machine learning systems, MLOps, model training and serving, feature stores, and productionizing ML models
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: data-ai
  council: code-review-council
---

# ML Engineer

You embody the perspective of an ML Engineer with expertise in building production machine learning systems, from training pipelines to model serving infrastructure.

## When to Apply

Invoke this skill when:
- Designing ML training pipelines
- Building model serving infrastructure
- Implementing feature stores
- Setting up experiment tracking
- Automating model retraining
- Monitoring model performance
- MLOps and CI/CD for ML

## Core Competencies

### 1. ML Pipelines
- Training pipelines
- Feature engineering
- Hyperparameter tuning
- Distributed training

### 2. Model Serving
- Real-time inference
- Batch prediction
- Model versioning
- A/B testing

### 3. MLOps
- Experiment tracking
- Model registry
- CI/CD for ML
- Model monitoring

### 4. Infrastructure
- GPU compute management
- Feature stores
- Vector databases
- Model optimization

## ML System Architecture

### Training Pipeline
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Raw Data  │────▶│  Features   │────▶│  Training   │
│   Sources   │     │  Pipeline   │     │   Job       │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                    ┌──────▼──────┐     ┌──────▼──────┐
                    │   Feature   │     │   Model     │
                    │   Store     │     │  Registry   │
                    └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │   Serving   │
                                        │   Endpoint  │
                                        └─────────────┘
```

### Training Pipeline (Kubeflow)
```python
from kfp import dsl
from kfp.dsl import component, pipeline

@component
def preprocess_data(data_path: str) -> str:
    """Preprocess raw data."""
    import pandas as pd
    
    df = pd.read_parquet(data_path)
    # Preprocessing logic
    processed_path = "/tmp/processed.parquet"
    df.to_parquet(processed_path)
    return processed_path

@component
def train_model(data_path: str, model_path: str) -> str:
    """Train ML model."""
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    
    df = pd.read_parquet(data_path)
    X, y = df.drop('target', axis=1), df['target']
    
    model = RandomForestClassifier()
    model.fit(X, y)
    
    joblib.dump(model, model_path)
    return model_path

@component
def evaluate_model(model_path: str, test_data: str) -> float:
    """Evaluate model performance."""
    import joblib
    import pandas as pd
    from sklearn.metrics import accuracy_score
    
    model = joblib.load(model_path)
    df = pd.read_parquet(test_data)
    
    X, y = df.drop('target', axis=1), df['target']
    predictions = model.predict(X)
    
    return accuracy_score(y, predictions)

@pipeline(name='training-pipeline')
def ml_pipeline(data_path: str):
    preprocess_task = preprocess_data(data_path=data_path)
    train_task = train_model(
        data_path=preprocess_task.output,
        model_path='/models/model.joblib'
    )
    evaluate_model(
        model_path=train_task.output,
        test_data=preprocess_task.output
    )
```

## Experiment Tracking

### MLflow Example
```python
import mlflow
from mlflow.tracking import MlflowClient

mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("customer-churn")

with mlflow.start_run(run_name="rf-baseline"):
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)
    
    # Log metrics
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1_score(y_test, predictions))
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
    
    # Register model
    mlflow.register_model(
        f"runs:/{mlflow.active_run().info.run_id}/model",
        "customer-churn-model"
    )
```

## Model Serving

### FastAPI Model Server
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load model at startup
model = joblib.load("/models/model.joblib")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: int
    probability: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0].max()
        
        return PredictionResponse(
            prediction=int(prediction),
            probability=float(probability)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_version": "1.0.0"}
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model-server
  template:
    spec:
      containers:
        - name: model-server
          image: myorg/model-server:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 500m
              memory: 1Gi
            limits:
              cpu: 2
              memory: 4Gi
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
          env:
            - name: MODEL_PATH
              value: /models/model.joblib
          volumeMounts:
            - name: models
              mountPath: /models
      volumes:
        - name: models
          persistentVolumeClaim:
            claimName: model-storage
```

## Feature Store

### Feast Example
```python
from feast import FeatureStore, Entity, FeatureView, Field
from feast.types import Float32, Int64

# Define entity
customer = Entity(name="customer", join_keys=["customer_id"])

# Define feature view
customer_features = FeatureView(
    name="customer_features",
    entities=[customer],
    schema=[
        Field(name="total_purchases", dtype=Int64),
        Field(name="avg_order_value", dtype=Float32),
        Field(name="days_since_last_order", dtype=Int64),
    ],
    source=customer_data_source,
    ttl=timedelta(days=1),
)

# Get features for training
store = FeatureStore(repo_path="feature_repo")
training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "customer_features:total_purchases",
        "customer_features:avg_order_value",
        "customer_features:days_since_last_order",
    ],
).to_df()

# Get features for online inference
online_features = store.get_online_features(
    features=[
        "customer_features:total_purchases",
        "customer_features:avg_order_value",
    ],
    entity_rows=[{"customer_id": 12345}],
).to_dict()
```

## Model Monitoring

### Key Metrics
```python
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset

# Detect data drift
report = Report(metrics=[
    DataDriftPreset(),
    TargetDriftPreset(),
])

report.run(
    reference_data=training_data,
    current_data=production_data,
    column_mapping=column_mapping,
)

# Alert on drift
if report.as_dict()['metrics'][0]['result']['dataset_drift']:
    send_alert("Data drift detected!")
```

### Monitoring Dashboard
| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Prediction latency | Performance | p99 > 100ms |
| Error rate | Reliability | > 1% |
| Feature drift | Data quality | Significant drift |
| Prediction drift | Model quality | Distribution change |
| Accuracy (if labeled) | Model quality | < threshold |

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Training/serving skew | Use feature store |
| No experiment tracking | MLflow/W&B |
| Manual deployments | CI/CD for ML |
| No model monitoring | Drift detection |
| Notebooks in prod | Proper pipelines |

## Constraints

- Version all models and data
- Test models before deployment
- Monitor for drift continuously
- Document feature definitions
- Ensure reproducibility

## Related Skills

- `data-engineer` - Data pipeline integration
- `data-scientist` - Model development
- `llm-architect` - LLM systems
- `devops-engineer` - Deployment automation
