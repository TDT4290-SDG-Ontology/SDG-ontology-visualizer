
const ci95 = (mean, std) => (mean - 1.96 * std, mean + 1.96 * std);
const ci90 = (mean, std) => (mean - 1.64 * std, mean + 1.64 * std);
const ci99 = (mean, std) => (mean - 2.58 * std, mean + 2.58 * std);


// all of these expressions are based on first order taylor approximations, as the values would otherwise not be analytically computable.
const expected_end_year = (-baseline_year*log(target/baseline) + baseline_year*log((pd_mean + prediction)/baseline) + current_year*log(target/baseline))/log((pd_mean + prediction)/baseline);
const variance_end_year = pd_std**2*(target/(latest + pd_mean))**(-2/(current_year - deadline))/(current_year**2*latest**2 + 2*current_year**2*latest*pd_mean + current_year**2*pd_mean**2 - 2*current_year*deadline*latest**2 - 4*current_year*deadline*latest*pd_mean - 2*current_year*deadline*pd_mean**2 + deadline**2*latest**2 + 2*deadline**2*latest*pd_mean + deadline**2*pd_mean**2);

const expected_current_cagr = -1 + (pd_mean/baseline + prediction/baseline)**(-1/(baseline_year - current_year));
const variance_current_cagr = pd_std**2*((pd_mean + prediction)/baseline)**(-2/(baseline_year - current_year))/(baseline_year**2*pd_mean**2 + 2*baseline_year**2*pd_mean*prediction + baseline_year**2*prediction**2 - 2*baseline_year*current_year*pd_mean**2 - 4*baseline_year*current_year*pd_mean*prediction - 2*baseline_year*current_year*prediction**2 + current_year**2*pd_mean**2 + 2*current_year**2*pd_mean*prediction + current_year**2*prediction**2);

const expected_required_cagr = -1 + (target/(pd_mean + prediction))**(-1/(current_year - deadline));
const variance_required_cagr = pd_std**2*(target/(pd_mean + prediction))**(-2/(current_year - deadline))/(current_year**2*pd_mean**2 + 2*current_year**2*pd_mean*prediction + current_year**2*prediction**2 - 2*current_year*deadline*pd_mean**2 - 4*current_year*deadline*pd_mean*prediction - 2*current_year*deadline*prediction**2 + deadline**2*pd_mean**2 + 2*deadline**2*pd_mean*prediction + deadline**2*prediction**2);

const expected_est_value = baseline*((pd_mean + prediction)/baseline)**((baseline_year - to_year)/(baseline_year - current_year));
const variance_est_value = baseline**2*pd_std**2*((pd_mean + prediction)/baseline)**(2*(baseline_year - to_year)/(baseline_year - current_year))*(baseline_year**2 - 2*baseline_year*to_year + to_year**2)/(baseline_year**2*pd_mean**2 + 2*baseline_year**2*pd_mean*prediction + baseline_year**2*prediction**2 - 2*baseline_year*current_year*pd_mean**2 - 4*baseline_year*current_year*pd_mean*prediction - 2*baseline_year*current_year*prediction**2 + current_year**2*pd_mean**2 + 2*current_year**2*pd_mean*prediction + current_year**2*prediction**2);
