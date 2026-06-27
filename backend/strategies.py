# strategies.py
# Implements the avalanche and snowball debt repayment strategies.

import copy
from debt import Debt


def run_strategy(debts: list[Debt], monthly_budget: float, strategy: str) -> dict:
    """
    Simulate a repayment strategy month by month.

    Args:
        debts:          List of Debt objects (will not be mutated).
        monthly_budget: Total dollars available each month for debt payments.
        strategy:       'avalanche' (highest APR first) or 'snowball' (lowest balance first).

    Returns:
        A dict with total_months, total_paid, total_interest, and a monthly payment log.
    """
    # Deep copy so we don't mutate the originals
    active_debts = copy.deepcopy(debts)

    # Validate the budget covers all minimums
    total_minimums = sum(d.minimum_payment for d in active_debts)
    if monthly_budget < total_minimums:
        raise ValueError(
            f"Monthly budget {monthly_budget:.2f} is less than total minimums {total_minimums:.2f}"
        )

    total_paid = 0.0
    total_interest = 0.0
    month = 0
    log = []  # Each entry = snapshot of balances at end of month

    while any(d.balance > 0 for d in active_debts):
        month += 1
        remaining_budget = monthly_budget
        month_interest = 0.0

        # Step 1: Apply interest to all active debts
        for d in active_debts:
            if d.balance > 0:
                interest = d.balance * d.monthly_rate
                d.balance += interest
                total_interest += interest
                month_interest += interest

        # Step 2: Pay minimums on all debts first
        for d in active_debts:
            if d.balance > 0:
                payment = min(d.minimum_payment, d.balance)
                d.balance -= payment
                d.balance = max(d.balance, 0)
                remaining_budget -= payment
                total_paid += payment

        # Step 3: Sort remaining debts by strategy to apply extra payment
        open_debts = [d for d in active_debts if d.balance > 0]

        if strategy == "avalanche":
            open_debts.sort(key=lambda d: d.annual_rate, reverse=True)  # Highest APR first
        elif strategy == "snowball":
            open_debts.sort(key=lambda d: d.balance)  # Lowest balance first
        else:
            raise ValueError(f"Unknown strategy: {strategy!r}")

        # Step 4: Apply any extra budget to the priority debt
        for d in open_debts:
            if remaining_budget <= 0:
                break
            extra = min(remaining_budget, d.balance)
            d.balance -= extra
            d.balance = max(d.balance, 0)
            remaining_budget -= extra
            total_paid += extra

        # Log this month's snapshot
        log.append({
            "month": month,
            "balances": {d.name: round(d.balance, 2) for d in active_debts},
            "interest_paid": round(month_interest, 2)
        })

        # Safety cap: prevent infinite loop on bad inputs
        if month > 1200:
            print("Warning: Exceeded 100-year cap. Check your inputs.")
            break

    return {
        "strategy": strategy,
        "total_months": month,
        "total_paid": round(total_paid, 2),
        "total_interest": round(total_interest, 2),
        "log": log
    }