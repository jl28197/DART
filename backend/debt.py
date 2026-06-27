# debt.py
# Represents a single debt account with all relevant attributes.

class Debt:
    def __init__(self, name: str, balance: float, annual_rate: float,
                 minimum_payment: float, is_revolving: bool = False):
        self.name            = name
        self.balance         = balance
        self.annual_rate     = annual_rate
        self.monthly_rate    = annual_rate / 12
        self.minimum_payment = minimum_payment
        self.is_revolving    = is_revolving   # True = credit card, False = fixed loan

    def __repr__(self):
        return (
            f"Debt(name={self.name!r}, balance=${self.balance:,.2f}, "
            f"APR={self.annual_rate*100:.2f}%, min=${self.minimum_payment:,.2f}, "
            f"revolving={self.is_revolving})"
        )