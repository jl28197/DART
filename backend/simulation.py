# simulation.py
# Monte Carlo simulation engine.
# Models three sources of real-world uncertainty:
#   1. Correlated interest rate shocks (market-wide + debt-specific)
#   2. Stochastic income — budget fluctuates month to month
#   3. Minimum payment recalculation for revolving debts (credit cards)

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from debt import Debt


# ── Constants ──────────────────────────────────────────────────────────────────

# Income scenario probabilities (must sum to 1.0)
PROB_LOWER  = 0.20    # 20% of months: unexpected expense or reduced income
PROB_NORMAL = 0.65    # 65% of months: budget stays close to plan
PROB_HIGHER = 0.15    # 15% of months: bonus, overtime, tax refund, etc.

# Income shock magnitudes
LOWER_SHOCK_MIN  = 0.10   # Budget drops by at least 10% in a bad month
LOWER_SHOCK_MAX  = 0.30   # Budget drops by at most 30% in a bad month
HIGHER_SHOCK_MIN = 0.05   # Budget increases by at least 5% in a good month
HIGHER_SHOCK_MAX = 0.20   # Budget increases by at most 20% in a good month

# Interest rate shock parameters
MARKET_SHOCK_STD = 0.003   # Std dev of the market-wide rate shock (shared across all debts)
IDIO_SHOCK_STD   = 0.001   # Std dev of the debt-specific shock (unique to each debt)

# Minimum payment floor for credit cards (as % of balance)
# Mirrors how most card issuers calculate minimums
CC_MIN_RATE  = 0.01    # 1% of remaining balance
CC_MIN_FLOOR = 25.0    # Never less than $25


# ── Income Shock ───────────────────────────────────────────────────────────────

def _apply_income_shock(base_budget: float, total_minimums: float) -> float:
    """
    Each month, determine which income scenario we're in and
    adjust the budget accordingly.

    Uses a discrete three-state model:
      - Lower  (20%): simulate an unexpected expense or income dip
      - Normal (65%): budget stays near its planned value with tiny noise
      - Higher (15%): bonus, tax refund, side income, or overtime

    The budget is always floored at total_minimums — even in a bad month
    the user still makes their minimum payments (we're not modeling default).

    Args:
        base_budget:    The user's planned monthly payment amount.
        total_minimums: Sum of all minimum payments — hard floor for budget.

    Returns:
        effective_budget: The adjusted budget for this month.
    """
    roll = np.random.random()   # Draw a uniform random number in [0, 1)

    if roll < PROB_LOWER:
        # Bad month — budget takes a hit
        shock_pct        = np.random.uniform(LOWER_SHOCK_MIN, LOWER_SHOCK_MAX)
        effective_budget = base_budget * (1 - shock_pct)

    elif roll < PROB_LOWER + PROB_NORMAL:
        # Normal month — tiny noise around the planned budget (±2%)
        noise            = np.random.normal(1.0, 0.02)
        effective_budget = base_budget * noise

    else:
        # Good month — budget gets a boost
        shock_pct        = np.random.uniform(HIGHER_SHOCK_MIN, HIGHER_SHOCK_MAX)
        effective_budget = base_budget * (1 + shock_pct)

    # Hard floor: never drop below what's needed to cover all minimums
    return max(effective_budget, total_minimums)


# ── Correlated Rate Shock ──────────────────────────────────────────────────────

def _apply_rate_shocks(active_debts: list, current_rates: list) -> list:
    """
    Apply a two-component interest rate shock:
      - market_shock: one draw shared by ALL debts this month.
                      Simulates Fed rate moves or macro conditions.
      - idio_shock:   a separate draw unique to each debt.
                      Simulates debt-specific repricing.

    This means in a bad rate month, ALL debts get more expensive —
    they don't independently average out. That's the key improvement
    over the old single-factor model.

    Args:
        active_debts:  List of Debt objects.
        current_rates: List of current effective monthly rates (one per debt),
                       maintained across months to carry rate state forward.

    Returns:
        new_rates: Updated list of effective monthly rates for this month.
    """
    # One market shock this month — applied to every debt
    market_shock = np.random.normal(0, MARKET_SHOCK_STD)

    new_rates = []
    for i, d in enumerate(active_debts):
        # Debt-specific noise on top of the market move
        idio_shock    = np.random.normal(0, IDIO_SHOCK_STD)
        shocked_rate  = current_rates[i] + market_shock + idio_shock

        # Floor at zero — rates can't go negative
        new_rates.append(max(0.0, shocked_rate))

    return new_rates


# ── Minimum Payment Recalculation ──────────────────────────────────────────────

def _recalculate_minimum(debt: Debt, current_balance: float) -> float:
    """
    Recalculate the minimum payment for a revolving debt (credit card)
    based on its current balance.

    Most card issuers use: max($25, 1% of balance + this month's interest)
    For simplicity we use:  max($25, 1% of balance)
    since interest is already being accrued separately in the main loop.

    For non-revolving debts (student loans, car loans), the minimum
    payment is contractually fixed — we leave it unchanged.

    Args:
        debt:            The Debt object (used to check if it's revolving).
        current_balance: The balance after this month's interest has accrued.

    Returns:
        The recalculated minimum payment for this month.
    """
    if not getattr(debt, 'is_revolving', False):
        # Fixed-term loan — minimum never changes
        return debt.minimum_payment

    if current_balance <= 0:
        return 0.0

    recalculated = max(CC_MIN_FLOOR, current_balance * CC_MIN_RATE)

    # Never let it exceed the full balance (don't overpay)
    return min(recalculated, current_balance)


# ── Main Monte Carlo Function ──────────────────────────────────────────────────

def run_monte_carlo(
    debts:         list,
    monthly_budget: float,
    strategy:      str  = "avalanche",
    n_simulations: int  = 2500,
    rate_std_dev:  float = 0.005   # Kept for API compatibility, not used directly
) -> dict:
    """
    Run the full Monte Carlo simulation across n_simulations independent futures.

    Each run models:
      - Correlated market-wide rate shocks + debt-specific noise
      - Monthly income/budget variance (3-state discrete model)
      - Dynamic minimum payment recalculation for revolving debts

    Args:
        debts:          List of Debt objects.
        monthly_budget: User's planned monthly budget.
        strategy:       'avalanche' or 'snowball'.
        n_simulations:  Number of independent simulation runs.
        rate_std_dev:   Legacy parameter — kept so api.py doesn't need changes.

    Returns:
        Dict with summary statistics and raw month/interest arrays.
    """
    import copy

    months_results   = []
    interest_results = []

    # Pre-compute total minimums once — used as income floor every month
    total_minimums = sum(d.minimum_payment for d in debts)

    for _ in range(n_simulations):
        active_debts = copy.deepcopy(debts)

        # Initialize current rates to each debt's base monthly rate.
        # These carry state between months — a rate that moved up last month
        # starts next month from that elevated level, not from the original.
        current_rates = [d.monthly_rate for d in active_debts]

        total_interest = 0.0
        month          = 0

        while any(d.balance > 0 for d in active_debts):
            month += 1

            # ── 1. Apply correlated rate shocks ───────────────────────────────
            current_rates = _apply_rate_shocks(active_debts, current_rates)

            # ── 2. Accrue interest at this month's shocked rates ──────────────
            for i, d in enumerate(active_debts):
                if d.balance > 0:
                    interest    = d.balance * current_rates[i]
                    d.balance  += interest
                    total_interest += interest

            # ── 3. Recalculate minimums for revolving debts ───────────────────
            for d in active_debts:
                if d.balance > 0:
                    d.minimum_payment = _recalculate_minimum(d, d.balance)

            # ── 4. Determine this month's effective budget ────────────────────
            # Recalculate current total minimums AFTER recalculation above
            # so the income floor reflects actual current minimums, not original ones
            current_total_minimums = sum(
                d.minimum_payment for d in active_debts if d.balance > 0
            )
            effective_budget = _apply_income_shock(monthly_budget, current_total_minimums)

            # ── 5. Pay minimums on all debts ──────────────────────────────────
            remaining_budget = effective_budget
            for d in active_debts:
                if d.balance > 0:
                    payment        = min(d.minimum_payment, d.balance)
                    d.balance      = max(d.balance - payment, 0)
                    remaining_budget -= payment

            # ── 6. Sort by strategy and apply extra budget ────────────────────
            open_debts = sorted(
                [d for d in active_debts if d.balance > 0],
                key    = lambda d: d.annual_rate if strategy == "avalanche" else d.balance,
                reverse = (strategy == "avalanche")
            )

            for d in open_debts:
                if remaining_budget <= 0:
                    break
                extra          = min(remaining_budget, d.balance)
                d.balance      = max(d.balance - extra, 0)
                remaining_budget -= extra

            # Safety cap — prevents infinite loops on edge case inputs
            if month > 600:
                break

        months_results.append(month)
        interest_results.append(total_interest)

    months_arr   = np.array(months_results)
    interest_arr = np.array(interest_results)

    return {
        "months":          months_arr,
        "interest":        interest_arr,
        "median_months":   int(np.median(months_arr)),
        "p10_months":      int(np.percentile(months_arr, 10)),
        "p90_months":      int(np.percentile(months_arr, 90)),
        "median_interest": float(np.median(interest_arr)),
    }


# ── Plotting ───────────────────────────────────────────────────────────────────

def plot_simulation_results(mc_result: dict, strategy: str):
    """Plot a histogram of Monte Carlo payoff timelines."""
    months = mc_result["months"]

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(months, bins=40, color="#4C72B0", edgecolor="white", alpha=0.85)
    ax.axvline(mc_result["median_months"], color="orange", linewidth=2,
               label=f"Median: {mc_result['median_months']} months")
    ax.axvline(mc_result["p10_months"], color="green", linewidth=1.5, linestyle="--",
               label=f"10th pct: {mc_result['p10_months']} months")
    ax.axvline(mc_result["p90_months"], color="red", linewidth=1.5, linestyle="--",
               label=f"90th pct: {mc_result['p90_months']} months")

    ax.set_title(f"Monte Carlo Payoff Timeline — {strategy.capitalize()}", fontsize=14)
    ax.set_xlabel("Months to Debt-Free")
    ax.set_ylabel("Frequency")
    ax.legend()
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{int(x):,}"))

    plt.tight_layout()
    plt.savefig(f"data/{strategy}_simulation.png", dpi=150)
    plt.close(fig)