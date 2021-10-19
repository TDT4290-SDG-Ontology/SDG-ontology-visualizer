import { assert } from 'chai';
import _ from 'lodash';
import { computeGDC } from '../gdc/gdc';

import { IndicatorScore, GDCOutput } from '../types/gdcTypes';

import {
  dataseries as trdDataseries,
  goals as trdGoals,
  historicalData as trdHistorical,
  gdcOutput as trdOutput,
} from './gdcData/no.5001-2020-no.5001';

const compareIndicators = (a: IndicatorScore, b: IndicatorScore) => {
  let equalDataseries = true;
  if (a.dataseries && b.dataseries) equalDataseries = _.isEqual(a.dataseries, b.dataseries);
  else if (a.dataseries && !b.dataseries) equalDataseries = false;
  else if (!a.dataseries && b.dataseries) equalDataseries = false;

  // Hack to avoid inequality when a has a.dataseries set to undefined, and b does not have the property,
  // as lodash treats these as unequal in that case.
  a.dataseries = 'test'; /* eslint-disable-line no-param-reassign */
  b.dataseries = 'test'; /* eslint-disable-line no-param-reassign */

  const equal = _.isEqual(a, b);

  // Set back to a compatible value
  a.dataseries = null; /* eslint-disable-line no-param-reassign */
  b.dataseries = null; /* eslint-disable-line no-param-reassign */

  return equal && equalDataseries;
};

const compareIndicatorMaps = (a: Map<string, IndicatorScore>, b: Map<string, IndicatorScore>) => {
  if (a.size !== b.size) return false;

  let allEqual = true;
  a.forEach((val, key) => {
    const other = b.get(key);
    if (!other) {
      allEqual = false;
      return;
    }

    allEqual = allEqual && compareIndicators(val, other);
  });

  return allEqual;
};

const compareGDCOutput = (a: GDCOutput, b: GDCOutput) => {
  const differences = (x, y) =>
    _.reduce(x, (res, val, key) => (_.isEqual(val, y[key]) ? res : res.concat(key)), []);

  const equalDomains = _.isEqual(a.domains, b.domains);
  if (!equalDomains) console.log(`Domain differences: ${differences(a.domains, b.domains)}`);

  const equalSubdomains = _.isEqual(a.subdomains, b.subdomains);
  if (!equalSubdomains)
    console.log(`Subdomain differences: ${differences(a.subdomains, b.subdomains)}`);

  const equalCategories = _.isEqual(a.categories, b.categories);
  if (!equalCategories)
    console.log(`Category differences: ${differences(a.categories, b.categories)}`);

  const equalIndicators = _.isEqualWith(a.indicators, b.indicators, compareIndicatorMaps);
  if (!equalIndicators)
    console.log(`Indicator differences: ${differences(a.indicators, b.indicators)}`);

  const equalWithoutGoals = _.isEqual(a.indicatorsWithoutGoals, b.indicatorsWithoutGoals);
  if (!equalWithoutGoals)
    console.log(
      `Without goal differences: ${differences(
        a.indicatorsWithoutGoals,
        b.indicatorsWithoutGoals,
      )}`,
    );

  const equalUnreported = _.isEqual(a.unreportedIndicators, b.unreportedIndicators);
  if (!equalUnreported)
    console.log(
      `Unreported differences: ${differences(a.unreportedIndicators, b.unreportedIndicators)}`,
    );

  return (
    equalDomains &&
    equalSubdomains &&
    equalCategories &&
    equalIndicators &&
    equalWithoutGoals &&
    equalUnreported
  );
};

describe('GDC output matches', () => {
  const computedOutput = computeGDC(trdDataseries, trdGoals, trdHistorical);

  it('should return "true"', async () => {
    assert(compareGDCOutput(computedOutput, trdOutput));
  });
});
