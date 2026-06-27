# Utility functions for loading data and formatting output.

import pandas as pd
from debt import Debt


def load_debts_from_csv(filepath: str) -> list[Debt]:
    """Read a CSV file and return a list of Debt objects."""
    df = pd.read_csv(filepath)
    debts = []
    for _, row in df.iterrows():
        debts.append(Debt(
            name=row["name"],
            balance=float(row["balance"]),
            annual_rate=float(row["annual_rate"]),
            minimum_payment=float(row["minimum_payment"])
        ))
    return debts


def format_currency(amount: float) -> str:
    """Format a float as a dollar string."""
    return f"${amount:,.2f}"


def format_months(months: int) -> str:
    """Convert a month count into a readable years/months string."""
    years = months // 12
    remaining = months % 12
    if years == 0:
        return f"{remaining} month(s)"
    elif remaining == 0:
        return f"{years} year(s)"
    else:
        return f"{years} year(s) and {remaining} month(s)"


def print_summary(strategy_name: str, result: dict):
    """Print a clean summary of a repayment strategy result."""
    print(f"\n{'='*45}")
    print(f"  Strategy: {strategy_name}")
    print(f"{'='*45}")
    print(f"  Total Months:     {format_months(result['total_months'])}")
    print(f"  Total Paid:       {format_currency(result['total_paid'])}")
    print(f"  Total Interest:   {format_currency(result['total_interest'])}")
    print(f"{'='*45}\n")

def create_debts_from_dicts(raw_debts: list[dict]) -> list:
    """
    Convert a list of plain dictionaries (from manual user input)
    into proper Debt objects — the same type that load_debts_from_csv returns.
    This means the rest of the program doesn't care whether the user
    typed their debts in or loaded them from a file. Same output either way.
    """
    from debt import Debt
    return [
        Debt(
            name=d["name"],
            balance=d["balance"],
            annual_rate=d["annual_rate"],
            minimum_payment=d["minimum_payment"]
        )
        for d in raw_debts   # This is a list comprehension replacing a for loop + append
    ]