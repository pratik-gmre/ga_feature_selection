import io
import uuid
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from ga.genetic_algorithm import GeneticAlgorithm
from ml.evaluator import MLEvaluator


app = FastAPI(
    title="GA Feature Selection API",
    description="Genetic Algorithm powered feature selection for ML models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


sessions: Dict[str, Dict[str, Any]] = {}


def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in sessions:
        raise HTTPException(
            status_code=404, detail=f"Session '{session_id}' not found."
        )
    return sessions[session_id]


class InitializeRequest(BaseModel):
    session_id: str
    target_column: str
    model_name: str = Field(
        "logistic_regression",
        description="logistic_regression | decision_tree | random_forest",
    )
    population_size: int = Field(30, ge=5, le=200)
    mutation_rate: float = Field(0.02, ge=0.0, le=1.0)
    crossover_rate: float = Field(0.8, ge=0.0, le=1.0)
    alpha: float = Field(
        0.1, ge=0.0, le=1.0, description="Feature count penalty weight"
    )
    elitism_count: int = Field(2, ge=0, le=10)
    test_size: float = Field(0.2, ge=0.05, le=0.5)


class RunRequest(BaseModel):
    session_id: str
    n_generations: int = Field(50, ge=1, le=500)
    crossover_type: str = Field("two_point", description="single_point | two_point")


class StepRequest(BaseModel):
    session_id: str
    crossover_type: str = Field("two_point")


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "GA Feature Selection API running"}


@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if df.shape[0] < 20:
        raise HTTPException(
            status_code=400, detail="Dataset too small (need ≥ 20 rows)."
        )
    if df.shape[1] < 2:
        raise HTTPException(status_code=400, detail="Dataset needs at least 2 columns.")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "df": df,
        "ga": None,
        "evaluator": None,
        "dataset_meta": None,
        "status": "uploaded",
    }

    columns = df.columns.tolist()
    dtypes = {col: str(df[col].dtype) for col in columns}
    null_counts = df.isnull().sum().to_dict()

    return {
        "session_id": session_id,
        "filename": file.filename,
        "n_rows": int(df.shape[0]),
        "n_cols": int(df.shape[1]),
        "columns": columns,
        "dtypes": dtypes,
        "null_counts": null_counts,
        "preview": df.head(5).fillna("").to_dict(orient="records"),
    }


@app.post("/initialize")
def initialize(req: InitializeRequest):

    session = get_session(req.session_id)
    df: pd.DataFrame = session["df"]

    evaluator = MLEvaluator(
        model_name=req.model_name,
        test_size=req.test_size,
        random_state=42,
    )

    try:
        meta = evaluator.load_dataframe(df, req.target_column)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    ga = GeneticAlgorithm(
        n_features=meta["n_features"],
        population_size=req.population_size,
        mutation_rate=req.mutation_rate,
        crossover_rate=req.crossover_rate,
        alpha=req.alpha,
        elitism_count=req.elitism_count,
    )
    ga.initialize_population()


    session["ga"] = ga
    session["evaluator"] = evaluator
    session["dataset_meta"] = meta
    session["status"] = "initialized"
    session["config"] = req.dict()

    return {
        "status": "initialized",
        "dataset_meta": meta,
        "ga_config": {
            "n_features": meta["n_features"],
            "population_size": req.population_size,
            "mutation_rate": req.mutation_rate,
            "crossover_rate": req.crossover_rate,
            "alpha": req.alpha,
            "elitism_count": req.elitism_count,
        },
    }


@app.post("/step")
def step_generation(req: StepRequest):

    session = get_session(req.session_id)
    ga: Optional[GeneticAlgorithm] = session.get("ga")
    evaluator: Optional[MLEvaluator] = session.get("evaluator")

    if ga is None or evaluator is None:
        raise HTTPException(
            status_code=400, detail="Session not initialized. Call /initialize first."
        )

    gen_stats = ga.step(evaluator.evaluate, crossover_type=req.crossover_type)

    if ga.best_individual is not None:
        acc, n_sel = evaluator.evaluate(ga.best_individual)
        gen_stats["best_accuracy"] = round(acc, 4)
    else:
        gen_stats["best_accuracy"] = None

    session["status"] = "running"

    return {
        "generation": gen_stats["generation"],
        "best_fitness": gen_stats["best_fitness"],
        "avg_fitness": gen_stats["avg_fitness"],
        "best_accuracy": gen_stats.get("best_accuracy"),
        "n_selected": gen_stats["n_selected"],
        "history": ga.history,
    }


@app.post("/run")
def run_full(req: RunRequest):

    session = get_session(req.session_id)
    ga: Optional[GeneticAlgorithm] = session.get("ga")
    evaluator: Optional[MLEvaluator] = session.get("evaluator")

    if ga is None or evaluator is None:
        raise HTTPException(
            status_code=400, detail="Session not initialized. Call /initialize first."
        )

    session["status"] = "running"

    accuracy_history: List[float] = []

    for _ in range(req.n_generations):
        gen_stats = ga.step(evaluator.evaluate, crossover_type=req.crossover_type)
        if ga.best_individual is not None:
            acc, _ = evaluator.evaluate(ga.best_individual)
            accuracy_history.append(round(acc, 4))
        else:
            accuracy_history.append(0.0)

    session["status"] = "done"
    session["accuracy_history"] = accuracy_history

    result = None
    if ga.best_individual is not None:
        result = evaluator.analyze_best_subset(ga.best_individual)

    return {
        "status": "done",
        "total_generations": ga.generation,
        "history": ga.history,
        "accuracy_history": accuracy_history,
        "result": result,
    }


@app.get("/result")
def get_result(session_id: str):

    session = get_session(session_id)
    ga: Optional[GeneticAlgorithm] = session.get("ga")
    evaluator: Optional[MLEvaluator] = session.get("evaluator")

    if ga is None or ga.best_individual is None:
        raise HTTPException(status_code=400, detail="No results yet. Run the GA first.")

    result = evaluator.analyze_best_subset(ga.best_individual)
    ga_state = ga.get_state()

    return {
        "session_id": session_id,
        "status": session.get("status"),
        "result": result,
        "ga_state": {
            "generation": ga_state["generation"],
            "best_fitness": ga_state["best_fitness"],
            "n_selected": ga_state["n_selected"],
        },
        "history": ga.history,
        "accuracy_history": session.get("accuracy_history", []),
        "dataset_meta": session.get("dataset_meta"),
        "config": session.get("config"),
    }


@app.get("/sessions")
def list_sessions():

    return {
        sid: {
            "status": s.get("status"),
            "n_features": (
                s["dataset_meta"]["n_features"] if s.get("dataset_meta") else None
            ),
        }
        for sid, s in sessions.items()
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
