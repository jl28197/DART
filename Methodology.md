# DART — Simulation Methodology

## Overview

DART uses Monte Carlo simulation to model personal debt repayment under
realistic uncertainty. Rather than producing a single deterministic payoff
date, it runs 2,500 independent simulations of your repayment journey —
each with slightly different conditions — and reports the distribution of
outcomes. The result is a probability estimate rather than a prediction.

---

## Why Monte Carlo

A deterministic model (one that calculates a single answer) assumes the
future is fixed: your interest rates never change, your income is perfectly
stable every month, and nothing unexpected ever happens. This produces a
precise-looking answer that is almost certainly wrong.

Monte Carlo simulation replaces that false precision with honest uncertainty.
By running thousands of simulations with randomized conditions, it produces
a distribution of possible outcomes — and from that distribution, a
probability estimate of hitting your goal. A result of "68% probability of
being debt-free within 4 years" is more useful than "you will be debt-free
in 3 years and 9 months" because it accurately communicates what we actually
know: the future is uncertain, and some futures are better than others.

The median is reported instead of the mean throughout the tool. The
distribution of payoff times is right-skewed — a small number of very bad
simulation runs (sustained rate increases, repeated low-income months) pull
the mean upward in a way that isn't representative of the typical outcome.
The median is resistant to this skew and better represents the central
tendency of realistic futures.

---

## The Three Simulation Factors

### 1. Correlated Interest Rate Shocks

Each month, a single market-wide rate shock is drawn from a normal
distribution (mean 0, standard deviation 0.3%) and applied to all
variable-rate debts simultaneously. A smaller debt-specific shock
(standard deviation 0.1%) is then added independently to each debt.

This two-component structure reflects how interest rates actually behave.
Macro forces — Federal Reserve policy, inflation expectations, credit market
conditions — affect all borrowers at the same time. When the Fed raises
rates, all your variable-rate debts get more expensive together, not
independently. The idiosyncratic component captures the smaller
debt-specific repricing that happens on top of that market move.

The rates carry state between months: each month's shock is applied to the
previous month's rate rather than the original base rate. This introduces
path dependency — a run where rates spike early and recover later is worse
than one where they spike late, because the early spike accrues on higher
balances.

### 2. Stochastic Income (Three-State Budget Model)

Each month, the simulation rolls a probability to determine which of three
income scenarios applies:

| Scenario | Probability | Effect |
|---|---|---|
| Lower | 20% | Budget reduced by 10–30% |
| Normal | 65% | Budget varies ±2% around plan |
| Higher | 15% | Budget increased by 5–20% |

The asymmetry (more bad months than good) reflects the empirical reality
that negative financial shocks tend to be more frequent and more sudden than
positive ones. The 20% lower probability corresponds to roughly 1 in 5
months experiencing some form of budget disruption — consistent with
real-world data on unexpected expenses for working adults.

The budget is always floored at the sum of all minimum payments. This keeps
the simulation within its intended scope: modeling a borrower who remains
current on all debts but whose surplus fluctuates. Modeling default,
penalty rates, and missed payments is outside the scope of this tool.

The income shock is drawn independently of the rate shock each month. This
means a bad rate month and a bad income month can — and occasionally do —
occur simultaneously, producing the compounding stress events that drive
the worst-case tail of the distribution.

### 3. Dynamic Minimum Payment Recalculation

For revolving debts (credit cards), the minimum payment is recalculated
each month as the greater of $25 or 1% of the current balance. This mirrors
how most card issuers calculate minimums in practice.

As balances fall, minimums decrease — freeing up more of the monthly budget
for the priority debt. This creates a positive feedback loop in the later
stages of repayment that slightly accelerates payoff. Holding minimums fixed
(as simpler models do) would underestimate this acceleration and make payoff
look marginally slower than it actually is for borrowers with revolving debt.

For fixed-term loans (student loans, car loans), the minimum payment is
contractually fixed and does not change throughout the simulation.

---

## Deliberate Scope Limitations

Several factors that would add marginal realism were intentionally excluded:

**Autocorrelated income shocks.** Each month's income scenario is drawn
independently. Real income disruptions often persist across multiple months
(a job loss affects several consecutive months, not just one). Modeling this
accurately requires a Markov chain income model, which would need additional
parameters the user cannot reasonably be expected to provide.

**Rate-income correlation.** In a recession, rates may fall (Fed cutting)
while income also falls (weakening job market). These factors are correlated
in reality but treated as independent here. Calibrating this correlation
accurately would require macroeconomic data beyond the scope of a personal
finance tool.

**Penalty rates and late fees.** The income floor prevents missed payments
in the model. Real revolving debt carries penalty APRs (sometimes 29.99%)
and late fees that trigger after missed payments. Modeling this accurately
would require a default sub-model that is out of scope for this tool.

**New debt accumulation.** The simulation assumes the debt list is fixed.
Real repayment periods often involve taking on new debt, which would
extend payoff significantly.

These exclusions are not oversights — they are scope decisions. A model that
makes many hidden assumptions is not more honest than a simpler one. It is
less honest, because its complexity creates an illusion of precision that
the underlying data does not support. The three-factor model captures the
dominant drivers of real-world variance while remaining explainable,
auditable, and grounded in the data the user actually provides.

---

## Interpreting Results

**Probability estimate:** The percentage of 2,500 simulation runs that
achieved debt-free status within your target timeframe. This is an empirical
frequency, not a theoretical formula — it is literally the count of
successful runs divided by total runs.

**P10 (Best case):** Only 10% of simulated futures finished faster than
this. Requires sustained favorable conditions throughout.

**Median:** Half of simulated futures finished faster, half slower. The most
representative single-number summary of your outlook.

**P90 (Worst case):** 90% of simulated futures finished within this time.
Only 10% of futures were worse. Treat this as your stress-test number.

**Sensitivity table:** Shows how your probability changes at different budget
levels. The gap between rows quantifies exactly what an extra $50 or $100
per month is worth in probability terms.