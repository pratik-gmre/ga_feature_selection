import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score
import warnings

warnings.filterwarnings("ignore")


class MLEvaluator:

    SUPPORTED_MODELS = {
        "logistic_regression": LogisticRegression,
        "decision_tree": DecisionTreeClassifier,
        "random_forest": RandomForestClassifier,
    }

    def __init__(
        self,
        model_name: str = "logistic_regression",
        test_size: float = 0.2,
        random_state: int = 42,
        cv_folds: int = 0,  # 0 = use train/test split, >1 = cross-validation
    ):
        self.model_name = model_name
        self.test_size = test_size
        self.random_state = random_state
        self.cv_folds = cv_folds

        self.X_train: Optional[np.ndarray] = None
        self.X_test: Optional[np.ndarray] = None
        self.y_train: Optional[np.ndarray] = None
        self.y_test: Optional[np.ndarray] = None
        self.feature_names: List[str] = []
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.n_features: int = 0
        self.n_classes: int = 0
        self.baseline_accuracy: float = 0.0  
        self.class_names: List[str] = []

    def load_dataframe(self, df: pd.DataFrame, target_column: str) -> Dict[str, Any]:

        df = df.copy()

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset.")

        y_raw = df[target_column]
        X_raw = df.drop(columns=[target_column])

        missing_thresh = 0.5
        X_raw = X_raw.loc[:, X_raw.isnull().mean() < missing_thresh]

        for col in X_raw.select_dtypes(include=["object", "category"]).columns:
            le = LabelEncoder()
            X_raw[col] = le.fit_transform(X_raw[col].astype(str))

        X_raw = X_raw.fillna(X_raw.median(numeric_only=True))

        self.feature_names = list(X_raw.columns)
        self.n_features = len(self.feature_names)

        y_encoded = self.label_encoder.fit_transform(y_raw.astype(str))
        self.class_names = list(self.label_encoder.classes_)
        self.n_classes = len(self.class_names)

        X_np = X_raw.values.astype(np.float64)

        X_tr, X_te, y_tr, y_te = train_test_split(
            X_np,
            y_encoded,
            test_size=self.test_size,
            random_state=self.random_state,
            stratify=y_encoded,
        )

        self.X_train = self.scaler.fit_transform(X_tr)
        self.X_test = self.scaler.transform(X_te)
        self.y_train = y_tr
        self.y_test = y_te

        self.baseline_accuracy = self._train_and_evaluate(
            np.ones(self.n_features, dtype=int)
        )

        return {
            "n_samples": len(df),
            "n_features": self.n_features,
            "n_classes": self.n_classes,
            "class_names": self.class_names,
            "feature_names": self.feature_names,
            "train_samples": len(self.X_train),
            "test_samples": len(self.X_test),
            "baseline_accuracy": round(self.baseline_accuracy, 4),
            "target_column": target_column,
        }

    def _build_model(self):

        model_cls = self.SUPPORTED_MODELS.get(self.model_name)
        if model_cls is None:
            raise ValueError(f"Unknown model: {self.model_name}")

        kwargs = {"random_state": self.random_state}
        if self.model_name == "logistic_regression":
            kwargs["max_iter"] = 500
            kwargs["solver"] = "lbfgs"
            kwargs["multi_class"] = "auto"
        return model_cls(**kwargs)

    def _train_and_evaluate(self, chromosome: np.ndarray) -> float:

        selected = np.where(chromosome == 1)[0]
        if len(selected) == 0:
            return 0.0

        X_tr = self.X_train[:, selected]
        X_te = self.X_test[:, selected]

        model = self._build_model()

        if self.cv_folds > 1:

            scores = cross_val_score(
                model, X_tr, self.y_train, cv=self.cv_folds, scoring="accuracy"
            )
            return float(scores.mean())
        else:
            model.fit(X_tr, self.y_train)
            y_pred = model.predict(X_te)
            return float(accuracy_score(self.y_test, y_pred))

    def evaluate(self, chromosome: np.ndarray) -> Tuple[float, int]:

        if self.X_train is None:
            raise RuntimeError("Dataset not loaded. Call load_dataframe() first.")
        n_selected = int(chromosome.sum())
        accuracy = self._train_and_evaluate(chromosome)
        return accuracy, n_selected

    def analyze_best_subset(self, chromosome: np.ndarray) -> Dict[str, Any]:

        selected_idx = np.where(chromosome == 1)[0]
        accuracy = self._train_and_evaluate(chromosome)
        selected_names = [self.feature_names[i] for i in selected_idx]
        reduction = 1.0 - len(selected_idx) / self.n_features

        return {
            "accuracy": round(accuracy, 4),
            "baseline_accuracy": round(self.baseline_accuracy, 4),
            "accuracy_delta": round(accuracy - self.baseline_accuracy, 4),
            "n_selected": len(selected_idx),
            "n_total": self.n_features,
            "feature_reduction_pct": round(reduction * 100, 1),
            "selected_features": selected_names,
            "selected_indices": selected_idx.tolist(),
            "model_name": self.model_name,
        }
