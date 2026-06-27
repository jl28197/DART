# backend/api.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import traceback

from debt import Debt
from strategies import run_strategy
from simulation import run_monte_carlo

app = FastAPI(title="D.A.R.T API")

# CORS lets your frontend (localhost:5173) talk to your
# backend (localhost:8000). Without this, the browser blocks the request.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # frontend dev server
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Input / Output shapes ──────────────────────────────────────────────────────
# Pydantic models define exactly what JSON shape this API accepts and returns.
# FastAPI automatically validates incoming data against these — if the
# front-end sends the wrong type or missing fields, it's rejected immediately.

class DebtInput(BaseModel):
    name:            str
    balance:         float = Field(gt=0)
    annual_rate:     float = Field(ge=0, lt=100)  # Expecting %, e.g. 19.99
    minimum_payment: float = Field(gt=0)
    is_revolving:    bool  = False   # defaults to False if not sent by frontend


class SimulateRequest(BaseModel):
    debts:          list[DebtInput]
    monthly_budget: float = Field(gt=0)
    target_months:  int   = Field(gt=0, le=600)
    strategy:       str   = "avalanche"
    n_simulations:  int   = 5000


class BalanceSnapshot(BaseModel):
    month:    int
    balances: dict[str, float]


class SimulateResponse(BaseModel):
    # Deterministic result
    total_months:      int
    total_paid:        float
    total_interest:    float
    # Monte Carlo result
    probability:       float
    median_months:     int
    p10_months:        int
    p90_months:        int
    median_interest:   float
    # Chart data
    histogram_data:    list[int]
    balance_over_time: list[BalanceSnapshot]


class SensitivityRow(BaseModel):
    budget:          float
    probability:     float | None
    median_months:   int   | None
    is_user_budget:  bool
    error:           str   | None = None


class SensitivityResponse(BaseModel):
    rows: list[SensitivityRow]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "DebtPath API is running"}


@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest):
    try:
        # Convert Pydantic inputs → your existing Debt objects
        # annual_rate comes in as a percentage (19.99), convert to decimal (0.1999)
        debts = [
            Debt(
                name            = d.name,
                balance         = d.balance,
                annual_rate     = d.annual_rate / 100,
                minimum_payment = d.minimum_payment,
                is_revolving    = d.is_revolving
                )
            for d in request.debts
        ]

        if request.strategy not in ("avalanche", "snowball"):
            raise HTTPException(status_code=400, detail="Strategy must be avalanche or snowball")

        # Run your existing logic — completely unchanged
        det_result = run_strategy(debts, request.monthly_budget, request.strategy)
        mc_result  = run_monte_carlo(
            debts,
            request.monthly_budget,
            strategy      = request.strategy,
            n_simulations = request.n_simulations
        )

        months_arr  = mc_result["months"]
        probability = float(
            np.sum(months_arr <= request.target_months) / len(months_arr) * 100
        )

        balance_snapshots = [
            BalanceSnapshot(month=e["month"], balances=e["balances"])
            for e in det_result["log"]
        ]

        return SimulateResponse(
            total_months      = det_result["total_months"],
            total_paid        = round(det_result["total_paid"], 2),
            total_interest    = round(det_result["total_interest"], 2),
            probability       = round(probability, 1),
            median_months     = mc_result["median_months"],
            p10_months        = mc_result["p10_months"],
            p90_months        = mc_result["p90_months"],
            median_interest   = round(mc_result["median_interest"], 2),
            histogram_data    = months_arr.tolist(),
            balance_over_time = balance_snapshots
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/sensitivity", response_model=SensitivityResponse)
def sensitivity(request: SimulateRequest):
    debts = [
        Debt(d.name, d.balance, d.annual_rate / 100, d.minimum_payment)
        for d in request.debts
    ]

    multipliers = [0.75, 0.85, 0.95, 1.00, 1.10, 1.25, 1.50]
    rows        = []

    for m in multipliers:
        budget = round(request.monthly_budget * m, 2)
        try:
            mc   = run_monte_carlo(debts, budget, strategy=request.strategy,
                                   n_simulations=500)
            prob = float(
                np.sum(mc["months"] <= request.target_months) / len(mc["months"]) * 100
            )
            rows.append(SensitivityRow(
                budget         = budget,
                probability    = round(prob, 1),
                median_months  = mc["median_months"],
                is_user_budget = abs(budget - request.monthly_budget) < 0.01
            ))
        except ValueError as e:
            rows.append(SensitivityRow(
                budget         = budget,
                probability    = None,
                median_months  = None,
                is_user_budget = False,
                error          = str(e)
            ))

    return SensitivityResponse(rows=rows)


@app.post("/api/compare")
def compare(request: SimulateRequest):
    results = {}

    for strat in ["avalanche", "snowball"]:
        # Rebuild the debt list fresh for every strategy
        # so there is zero chance of state leaking between runs
        debts = [
            Debt(
                name            = d.name,
                balance         = d.balance,
                annual_rate     = d.annual_rate / 100,
                minimum_payment = d.minimum_payment,
                is_revolving    = d.is_revolving
            )
            for d in request.debts
        ]

        r = run_strategy(debts, request.monthly_budget, strat)
        results[strat] = {
            "total_months":   r["total_months"],
            "total_paid":     round(r["total_paid"], 2),
            "total_interest": round(r["total_interest"], 2),
        }

    return results