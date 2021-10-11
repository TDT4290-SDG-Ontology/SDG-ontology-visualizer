from sympy import *
from sympy.stats import *
from sympy.assumptions.refine import *

mean = Symbol('pd_mean', real = True)
std = Symbol('pd_std', real = True, positive = True)
pred_diff = Normal('pred_diff', mean, std)

# TODO: redo this so that we measure deviance from the predicted values...
pred = Symbol('prediction', real = True, positive = True)
current_value = pred + pred_diff
current_year = Symbol('current_year', real = True, positive = True)

target = Symbol('target', real = True)
deadline = Symbol('deadline', real = True, positive = True)

baseline = Symbol('baseline', real = True, nonnegative = True)
baseline_year = Symbol('baseline_year', real = True, positive = True)


x = current_value
x_0 = E(current_value)
inv_log = 1 / log(x_0 / baseline) - (x - x_0) / (x_0 * log(x_0 / baseline) ** 2)

end_year = baseline_year + (current_year - baseline_year) * log(target / baseline) * inv_log


# only first order approx this time, as the expression would otherwise be somewhat insane...
m = 1 / (current_year - baseline_year)
a = (x_0 / baseline) ** m
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

print("\n\nCompletion year:")
print("Expected value:")
print(simplify(E(end_year)))

print("\n\nStd-dev:")
print(simplify(sqrt(variance(end_year))))

print("\n\nCurrent CAGR:")
print("Expected value:")
print(simplify(E(current_cagr)))

print("\n\nStd-dev:")
print(simplify(sqrt(variance(current_cagr))))

print("\n\nRequired CAGR:")
print("Expected value:")
print(simplify(E(required_cagr)))

print("\n\nStd-dev:")
print(simplify(sqrt(variance(required_cagr))))

print("\n\nEstimated value:")
print("Expected value:")
print(simplify(E(est_value)))

print("\n\nStd-dev:")
print(simplify(sqrt(variance(est_value))))
	