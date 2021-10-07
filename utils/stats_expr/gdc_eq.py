from sympy import *
from sympy.stats import *
from sympy.assumptions.refine import *

mean = Symbol('mean', real = True)
std = Symbol('std', real = True, positive = True)

current_value = Normal('current_value', mean, std)
current_year = Symbol('current_year', real = True, positive = True)

target = Symbol('target', real = True)
deadline = Symbol('deadline', real = True, positive = True)

baseline = Symbol('baseline', real = True, nonnegative = True)
baseline_year = Symbol('baseline_year', real = True, positive = True)

x = current_value
x_0 = E(current_value)
inv_log = 1 / log(x_0 / baseline) - (x - x_0) / (x_0 * log(x_0 / baseline) ** 2)

end_year = baseline_year + (current_year - baseline_year) * log(target / baseline) * inv_log


m = 1 / (current_year - baseline_year)
a = (x_0 / baseline) ** m

# only first order approx this time, as the expression would otherwise be somewhat insane...
current_cagr = a + m * (x - x_0) * a / x_0 - 1

year = Symbol('to_year', real = True, positive = True)

# yet again a first order approximation
mn = ((year - baseline_year) / (current_year - baseline_year))
amn = baseline * (x_0 / baseline) ** mn
est_value = amn + mn * (x - x_0) * amn / x_0

# similarly do a first order approx...
m = 1 / (deadline - current_year)
a = (target / x_0) ** m
required_cagr = a - m * (x - x_0) * a / x_0 - 1

print("Expected value:")
print(simplify(E(est_value)))

print("\n\nVariance:")
print(simplify(variance(est_value)))
	