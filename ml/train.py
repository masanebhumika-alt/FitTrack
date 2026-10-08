"""
FitTrack ML component: estimate daily calorie needs from body stats.

What this script does (the ML lifecycle for Assignment 2):
  1. builds a training dataset
  2. trains several candidate models (each one is an MLflow "run")
  3. logs parameters, metrics and the trained model for every run
  4. registers the best model in the MLflow Model Registry (creates a new version)
  5. points the alias "champion" at that version (this is the model we deploy)

NOTE: there is no public dataset for this. The training data is GENERATED from the same
Mifflin-St Jeor formula FitTrack already uses (plus random noise), so the model learns to
estimate calories from age, gender, height, weight and activity level. Results are estimates.
"""
import os

import mlflow
import numpy as np
import pandas as pd
from mlflow import MlflowClient
from mlflow.models import infer_signature
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

TRACKING_URI = os.environ.get("MLFLOW_TRACKING_URI", "http://localhost:5000")
EXPERIMENT_NAME = "fittrack-calorie-estimator"
MODEL_NAME = "fittrack-calorie-model"
FEATURES = ["age", "gender_male", "height_cm", "weight_kg", "activity_factor"]
TARGET = "daily_calories"
ROWS = 3000
TEST_SIZE = 0.2
SEED = 42


def make_dataset(rows: int = ROWS, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    male = rng.integers(0, 2, rows)
    age = rng.integers(18, 71, rows)
    height = np.where(male == 1, rng.normal(176, 7, rows), rng.normal(163, 6, rows)).clip(145, 200)
    weight = ((22 + rng.normal(0, 3.5, rows)) * (height / 100) ** 2).clip(40, 140)  # BMI about 22
    activity = rng.choice([1.2, 1.375, 1.55, 1.725, 1.9], rows, p=[0.25, 0.3, 0.25, 0.15, 0.05])

    bmr = 10 * weight + 6.25 * height - 5 * age + np.where(male == 1, 5, -161)  # Mifflin-St Jeor
    calories = bmr * activity + rng.normal(0, 50, rows)  # noise = real life is not exact

    df = pd.DataFrame(
        {
            "age": age,
            "gender_male": male,
            "height_cm": height,
            "weight_kg": weight,
            "activity_factor": activity,
            TARGET: calories,
        }
    )
    return df.astype("float64")


# (run name, model object, hyper-parameters to log)
CANDIDATES = [
    ("linear_regression", LinearRegression(), {}),
    (
        "random_forest_depth6",
        RandomForestRegressor(n_estimators=100, max_depth=6, random_state=SEED),
        {"n_estimators": 100, "max_depth": 6},
    ),
    (
        "random_forest_depth12",
        RandomForestRegressor(n_estimators=100, max_depth=12, random_state=SEED),
        {"n_estimators": 100, "max_depth": 12},
    ),
    (
        "gradient_boosting",
        GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=3, random_state=SEED),
        {"n_estimators": 150, "learning_rate": 0.1, "max_depth": 3},
    ),
]


def main() -> None:
    mlflow.set_tracking_uri(TRACKING_URI)
    mlflow.set_experiment(EXPERIMENT_NAME)

    df = make_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df[TARGET], test_size=TEST_SIZE, random_state=SEED
    )

    results = []
    for run_name, model, hyper_params in CANDIDATES:
        with mlflow.start_run(run_name=run_name) as run:
            # 1) parameters
            mlflow.log_param("model_type", type(model).__name__)
            mlflow.log_params(hyper_params)
            mlflow.log_param("dataset_rows", ROWS)
            mlflow.log_param("test_size", TEST_SIZE)
            mlflow.log_param("features", ",".join(FEATURES))

            # 2) train and evaluate
            model.fit(X_train, y_train)
            predictions = model.predict(X_test)
            rmse = float(np.sqrt(mean_squared_error(y_test, predictions)))
            mae = float(mean_absolute_error(y_test, predictions))
            r2 = float(r2_score(y_test, predictions))

            # 3) metrics
            mlflow.log_metric("rmse", rmse)
            mlflow.log_metric("mae", mae)
            mlflow.log_metric("r2", r2)

            # 4) the trained model itself (with its input/output schema and an example)
            signature = infer_signature(X_train, model.predict(X_train))
            mlflow.sklearn.log_model(
                model, artifact_path="model", signature=signature, input_example=X_train.head(3)
            )

            results.append((run.info.run_id, run_name, rmse, mae, r2))
            print(f"{run_name:<24} rmse={rmse:8.2f}  mae={mae:8.2f}  r2={r2:.4f}")

    # 5) choose the best run (lowest error) and register it as a new model version
    best_run_id, best_name, best_rmse, _, _ = min(results, key=lambda r: r[2])
    version = mlflow.register_model(f"runs:/{best_run_id}/model", MODEL_NAME)

    client = MlflowClient()
    client.update_model_version(
        name=MODEL_NAME,
        version=version.version,
        description=f"{best_name}, test RMSE {best_rmse:.2f} kcal. Trained on generated data.",
    )
    client.set_model_version_tag(MODEL_NAME, version.version, "algorithm", best_name)
    client.set_registered_model_alias(MODEL_NAME, "champion", version.version)  # the deployed model

    print(f"\nBest model: {best_name} (rmse {best_rmse:.2f})")
    print(f"Registered '{MODEL_NAME}' version {version.version} and set alias 'champion'")


if __name__ == "__main__":
    main()
