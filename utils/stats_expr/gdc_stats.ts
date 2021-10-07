
const ci95 = (mean, std) => (mean - 1.96 * std, mean + 1.96 * std);
const ci90 = (mean, std) => (mean - 1.64 * std, mean + 1.64 * std);
const ci99 = (mean, std) => (mean - 2.58 * std, mean + 2.58 * std);


// all of these expressions are based on first order taylor approximations, as the values would otherwise not be analytically computable.
const expected_end_year = (baseline_year * log(mean / baseline) + (current_year - baseline_year) * log(target / baseline)) / log(mean / baseline)
const variance_end_year = std ** 2 * (baseline_year ** 2 - 2 * baseline_year * current_year + current_year ** 2) * log(target / baseline) ** 2 / (mean ** 2 * log(mean/baseline) ** 4)

const expected_current_cagr = (mean/baseline)**(-1/(baseline_year - current_year)) - 1
const variance_current_cagr = std ** 2 * (mean / baseline) ** (-2/(baseline_year - current_year))/(mean**2*(baseline_year**2 - 2*baseline_year*current_year + current_year**2))

const expected_required_cagr = (target/mean)**(-1/(current_year - deadline)) - 1
const variance_required_cagr = std**2*(target/mean)**(-2/(current_year - deadline))/(mean**2*(current_year**2 - 2*current_year*deadline + deadline**2))

const expected_est_value = baseline*(mean/baseline)**((baseline_year - to_year)/(baseline_year - current_year));
const variance_est_value = baseline**2*std**2*(mean/baseline)**(2*(baseline_year - to_year)/(baseline_year - current_year))*(baseline_year**2 - 2*baseline_year*to_year + to_year**2)/(mean**2*(baseline_year**2 - 2*baseline_year*current_year + current_year**2));
