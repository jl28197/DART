# D.A.R.T — Debt Analysis and Repayment Tool

> A web application that models personal debt repayment strategies and gives you a probabilistic estimate of reaching your debt-free goal.

🔗 **[Live Demo](https://dart-henna.vercel.app)**  
💻 **[GitHub](https://github.com/j28197/DART)**

---

## What Is DART?

DART is an educational web application that models personal debt repayment 
strategies through Monte Carlo simulation. It runs 5,000 independent 
simulations under randomized real-world conditions — interest rate 
fluctuations, monthly income variance, and revolving credit behavior — 
to give users a probabilistic estimate of achieving debt freedom through 
the avalanche and snowball methods.

Built as a personal project to explore the intersection of financial 
modeling and software development. The goal was to create something 
genuinely useful for everyday financial decision-making — not just a 
calculator, but a tool that honestly communicates uncertainty.

---

## What Problem Does It Solve?

Most debt payoff calculators give you a single answer — "you'll be 
debt-free in 3 years and 4 months." That precision is misleading. 
Interest rates change, income varies, and life doesn't follow a 
fixed schedule.

DART replaces that false precision with an honest probability estimate. 
Instead of one answer, it shows you what percentage of 5,000 simulated 
futures hit your goal — so you can make decisions based on realistic 
uncertainty rather than an oversimplified projection.

---

## Features

- **Strategy Comparison** — models avalanche and snowball methods side by side
- **5,000 Monte Carlo Simulations** — each run under randomized conditions
- **Probabilistic Feasibility Estimate** — your percentage chance of hitting your goal
- **Budget Sensitivity Analysis** — how your probability shifts at different budget levels
- **Balance Over Time Chart** — how each debt decreases under your strategy
- **Sample Data** — explore the tool instantly without entering your own numbers
- **Mobile Responsive** — works on any screen size

---

## How to Use It

1. Enter your debts — name, balance, interest rate, and minimum payment
2. Set your monthly budget
3. Set your debt-free target in years and months
4. Choose a strategy — avalanche or snowball
5. Run the simulation

No account required. No sensitive data stored. Use approximate numbers 
— the tool is designed for exploration, not exact planning.

---

## Tech Stack

**Backend:** Python, FastAPI, NumPy, Pandas  
**Frontend:** React, Recharts, Vite  
**Deployed on:** Render and Vercel

---

## Methodology

For a full breakdown of the simulation design and modeling decisions, 
see [METHODOLOGY.md](./METHODOLOGY.md).

---

## Running Locally

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn api:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

*Built for educational purposes. Not financial advice.*
