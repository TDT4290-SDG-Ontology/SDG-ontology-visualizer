import {
  Stack,
  Text,
  Container,
  Button,
  Table,
  Tbody,
  Thead,
  Tr,
  Th,
  Td,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { IndicatorScore, CorrelatedKPI, IndicatorWithoutGoal } from '../../types/gdcTypes';

import { getCorrelatedKPIs } from '../../api/gdc';
import u4sscKPIMap from '../../common/u4sscKPIMap';

import GDCPlot from '../atoms/GDCPlot';

const correlationLabel = (name: string, corr: number) => {
  // TODO: need? to invert correlation number for 'INV_...' calculations.

  let labelText: string;
  let tooltipLabel: string;
  if (corr >= 0.7) {
    labelText = 'Strong synergy';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to an equivalent improvement in this KPI`;
  } else if (corr >= 0.4) {
    labelText = 'Moderate synergy';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to a moderate improvement in this KPI`;
  } else if (corr >= 0.1) {
    labelText = 'Weak synergy';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to a small improvement in this KPI`;
  } else if (corr <= -0.7) {
    labelText = 'Strong tradeoff';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to an equivalent regression in this KPI`;
  } else if (corr <= -0.4) {
    labelText = 'Moderate tradeoff';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to a moderate regression in this KPI`;
  } else if (corr <= -0.1) {
    labelText = 'Weak tradeoff';
    tooltipLabel = `An improvement in the "${name}" KPI would lead to a small regression in this KPI`;
  } else {
    labelText = 'Ambigouos';
    tooltipLabel = 'This correlation is ambigouos';
  }

  return (
    <Tooltip label={tooltipLabel}>
      <Text
        fontWeight="bold"
        color={`${corr > 0.0 ? 'green' : 'red'}.600`}
        decoration="underline dotted"
      >
        {labelText}
      </Text>
    </Tooltip>
  );
};

type GDCPanelProps = {
  year: number;

  municipality: string;
  data: IndicatorScore | IndicatorWithoutGoal;

  compareMunicipality?: string;
  compareData?: IndicatorScore | IndicatorWithoutGoal;
};

const defaultProps = {
  compareMunicipality: undefined,
  compareData: undefined,
};

const CUTOFF_DONE_PCT = 99.5;

const GDCView: React.FC<GDCPanelProps> = (props: GDCPanelProps) => {
  const [isLoadingCorrelated, setLoadingCorrelated] = useState<boolean>(false);
  const [correlatedKPIs, setCorrelatedKPIs] = useState<CorrelatedKPI[]>();

  const { year, municipality, data, compareMunicipality, compareData } = props;

  const loadCorrelatedKPIs = async () => {
    setLoadingCorrelated(true);

    const correlations = await getCorrelatedKPIs(data.kpi);
    setCorrelatedKPIs(correlations.sort((a, b) => b.correlation - a.correlation));

    setLoadingCorrelated(false);
  };

  const dataIsIndicatorScore = (data as IndicatorScore).goal !== undefined;
  const compareIsIndicatorScore =
    compareData !== undefined && (compareData as IndicatorScore).goal !== undefined;

  const dummyGrowth = { value: 0, startYear: year, endYear: year };
  const bestGrowth =
    data.yearlyGrowth.length > 0 ? data.yearlyGrowth[data.yearlyGrowth.length - 1] : dummyGrowth;
  const worstGrowth = data.yearlyGrowth.length > 0 ? data.yearlyGrowth[0] : dummyGrowth;

  const currentValue = data.historicalData[data.historicalData.length - 1].value;
  const currentYear = data.historicalData[data.historicalData.length - 1].year;

  let bestCompletion = -1;
  let worstCompletion = -1;
  if (dataIsIndicatorScore && data.yearlyGrowth.length > 1) {
    bestCompletion =
      currentYear +
      Math.log((data as IndicatorScore).goal.target / currentValue) /
        Math.log(bestGrowth.value + 1.0);
    worstCompletion =
      currentYear +
      Math.log((data as IndicatorScore).goal.target / currentValue) /
        Math.log(worstGrowth.value + 1.0);

    // If the completion dates are in the past, double check against score to make sure
    // they acutally are completed, and the municipality isn't just doing *extremely* badly!
    if (bestCompletion < currentYear && (data as IndicatorScore).score < CUTOFF_DONE_PCT)
      bestCompletion = -1;

    if (worstCompletion < currentYear && (data as IndicatorScore).score < CUTOFF_DONE_PCT)
      worstCompletion = -1;
  }

  const projectedCompletion = dataIsIndicatorScore
    ? +(data as IndicatorScore).projectedCompletion.toFixed(1)
    : -1;

  let correlatedTable = null;
  if (correlatedKPIs !== undefined && correlatedKPIs !== null) {
    if (correlatedKPIs.length === 0) {
      correlatedTable = (
        <Container minWidth="800px">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>KPI</Th>
                <Th>Strength</Th>
                <Th>From SDG target</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>None mapped.</Td>
                <Td />
                <Td />
              </Tr>
            </Tbody>
          </Table>
        </Container>
      );
    } else {
      correlatedTable = (
        <Container minWidth="800px">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>KPI</Th>
                <Th>Name</Th>
                <Th>Strength</Th>
                <Th isNumeric>From SDG target</Th>
              </Tr>
            </Thead>
            <Tbody>
              {correlatedKPIs.map((kpi) => {
                const display = u4sscKPIMap.get(kpi.kpi);
                const displayName = display === undefined ? '' : display.eng;
                const name = display === undefined ? <Td /> : <Td>{display.eng}</Td>;
                return (
                  <Tr key={kpi.kpi}>
                    <Td minWidth="175px">{kpi.kpi}</Td>
                    {name}
                    <Td>{correlationLabel(displayName, kpi.correlation)}</Td>
                    <Td isNumeric>{kpi.subgoal.replace(') Teknologi', '')}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Container>
      );
    }
  }

  let loadCorrelatedButton = null;
  if (correlatedKPIs === undefined) {
    loadCorrelatedButton = (
      <Button isLoading={isLoadingCorrelated} onClick={() => loadCorrelatedKPIs()} p="0px" m="16">
        Load correlated KPIs
      </Button>
    );
  }

  let statsHeaders = (
    <Th minWidth="155px" isNumeric>
      Value
    </Th>
  );
  let compPoints = null;
  let compScore = null;
  let compCompletion = null;
  let compWillComplete = null;
  let compCurrentCAGR = null;
  let compRequiredCAGR = null;
  let compBestCAGR = null;
  let compWorstCAGR = null;
  let compMean = null;
  let compStd = null;
  let compTrendMean = null;
  let compTrendStd = null;
  let compBestCompletion = null;
  let compWorstCompletion = null;
  if (compareData !== undefined) {
    const compBestGrowth =
      compareData.yearlyGrowth.length > 0
        ? compareData.yearlyGrowth[compareData.yearlyGrowth.length - 1]
        : dummyGrowth;
    const compWorstGrowth =
      compareData.yearlyGrowth.length > 0 ? compareData.yearlyGrowth[0] : dummyGrowth;
    const compProjectedCompletion = compareIsIndicatorScore
      ? +(compareData as IndicatorScore).projectedCompletion.toFixed(1)
      : -1;

    const compCurrentValue =
      compareData.historicalData[compareData.historicalData.length - 1].value;
    const compCurrentYear = compareData.historicalData[compareData.historicalData.length - 1].year;
    let compBestCompletionYear = -1;
    let compWorstCompletionYear = -1;
    if (compareIsIndicatorScore && compareData.yearlyGrowth.length > 1) {
      compBestCompletionYear =
        compCurrentYear +
        Math.log((compareData as IndicatorScore).goal.target / compCurrentValue) /
          Math.log(compBestGrowth.value + 1.0);
      compWorstCompletionYear =
        compCurrentYear +
        Math.log((compareData as IndicatorScore).goal.target / compCurrentValue) /
          Math.log(compWorstGrowth.value + 1.0);

      if (
        compBestCompletionYear < compCurrentYear &&
        (compareData as IndicatorScore).score < CUTOFF_DONE_PCT
      )
        compBestCompletionYear = -1;

      if (
        compWorstCompletionYear < compCurrentYear &&
        (compareData as IndicatorScore).score < CUTOFF_DONE_PCT
      )
        compWorstCompletionYear = -1;
    }

    statsHeaders = (
      <>
        <Th minWidth="155px" isNumeric pl="0">
          {municipality}
        </Th>
        <Th minWidth="155px" isNumeric pl="0">
          {compareMunicipality}
        </Th>
      </>
    );

    let compPointsOutput: number | string = 'N/A';
    let compScoreOutput: number | string = 'N/A';
    let compProjectedCompletionOutput: number | string = 'N/A';
    let compWillCompleteOutput: number | string = 'N/A';
    let compRequiredCAGROutput: number | string = 'N/A';
    let compDiffMeanOutput: number | string = 'N/A';
    let compDiffStdOutput: number | string = 'N/A';
    let compBestCompletionOutput: number | string = 'N/A';
    let compWorstCompletionOutput: number | string = 'N/A';
    if (compareIsIndicatorScore) {
      compPointsOutput = (compareData as IndicatorScore).points;
      compScoreOutput = (compareData as IndicatorScore).score.toFixed(2);
      compWillCompleteOutput = (compareData as IndicatorScore).willCompleteBeforeDeadline
        ? 'Yes'
        : 'No';

      if (compCurrentYear < (compareData as IndicatorScore).goal.deadline) {
        compRequiredCAGROutput = (100.0 * (compareData as IndicatorScore).requiredCAGR).toFixed(2);
      }

      compDiffMeanOutput = (compareData as IndicatorScore).diffMean.toFixed(2);
      compDiffStdOutput = (compareData as IndicatorScore).diffStd.toFixed(2);

      if (
        compProjectedCompletion < compCurrentYear &&
        (compareData as IndicatorScore).score >= CUTOFF_DONE_PCT
      ) {
        compProjectedCompletionOutput = 'Attained';
      } else {
        compProjectedCompletionOutput =
          compProjectedCompletion < 0 ? 'Never' : compProjectedCompletion.toFixed(1);
      }

      if (
        compBestCompletionYear < compCurrentYear &&
        (compareData as IndicatorScore).score >= CUTOFF_DONE_PCT
      ) {
        compBestCompletionOutput = 'Attained';
      } else {
        compBestCompletionOutput =
          compBestCompletionYear < 0 ? 'Never' : compBestCompletionYear.toFixed(1);
      }

      if (
        compWorstCompletionYear < compCurrentYear &&
        (compareData as IndicatorScore).score >= CUTOFF_DONE_PCT
      ) {
        compWorstCompletionOutput = 'Attained';
      } else {
        compWorstCompletionOutput =
          compWorstCompletionYear < 0 ? 'Never' : compWorstCompletionYear.toFixed(1);
      }
    }

    const compCurrentCAGROutput = (100.0 * compareData.currentCAGR).toFixed(2);

    compPoints = (
      <Td isNumeric pl="0">
        {compPointsOutput}
      </Td>
    );
    compScore = (
      <Td isNumeric pl="0">
        {compScoreOutput}
      </Td>
    );
    compCompletion = (
      <Td isNumeric pl="0">
        {compProjectedCompletionOutput}
      </Td>
    );
    compWillComplete = (
      <Td isNumeric pl="0">
        {compWillCompleteOutput}
      </Td>
    );
    compCurrentCAGR = <Td isNumeric pl="0">{`${compCurrentCAGROutput} %`}</Td>;
    compRequiredCAGR = <Td isNumeric pl="0">{`${compRequiredCAGROutput} %`}</Td>;
    compBestCAGR = (
      <Td isNumeric pl="0">
        {`${(100.0 * compBestGrowth.value).toFixed(2)} %`}
        <br />
        {`(${compBestGrowth.startYear} to ${compBestGrowth.endYear})`}
      </Td>
    );

    compBestCompletion = (
      <Td isNumeric pl="0">
        {compBestCompletionOutput}
      </Td>
    );

    compWorstCAGR = (
      <Td isNumeric pl="0">
        {`${(100.0 * compWorstGrowth.value).toFixed(2)} %`}
        <br />
        {`(${compWorstGrowth.startYear} to ${compWorstGrowth.endYear})`}
      </Td>
    );

    compWorstCompletion = (
      <Td isNumeric pl="0">
        {compWorstCompletionOutput}
      </Td>
    );

    compMean = (
      <Td isNumeric pl="0">
        {compDiffMeanOutput}
      </Td>
    );
    compStd = (
      <Td isNumeric pl="0">
        {compDiffStdOutput}
      </Td>
    );
    compTrendMean = <Td isNumeric pl="0">{`${(100.0 * compareData.trendMean).toFixed(2)} %`}</Td>;
    compTrendStd = <Td isNumeric pl="0">{`${(100.0 * compareData.trendStd).toFixed(2)} %`}</Td>;
  }

  let pointsOutput: number | string = 'N/A';
  let scoreOutput: number | string = 'N/A';
  let projectedCompletionOutput: number | string = 'N/A';
  let willCompleteOutput: number | string = 'N/A';
  let requiredOutput: number | string = 'N/A';
  let diffMeanOutput: number | string = 'N/A';
  let diffStdOutput: number | string = 'N/A';
  let bestCompletionOutput: number | string = 'N/A';
  let worstCompletionOutput: number | string = 'N/A';
  if (dataIsIndicatorScore) {
    pointsOutput = (data as IndicatorScore).points;
    scoreOutput = (data as IndicatorScore).score.toFixed(2);
    willCompleteOutput = (data as IndicatorScore).willCompleteBeforeDeadline ? 'Yes' : 'No';

    if (currentYear < (data as IndicatorScore).goal.deadline) {
      requiredOutput = (100.0 * (data as IndicatorScore).requiredCAGR).toFixed(2);
    }

    diffMeanOutput = (data as IndicatorScore).diffMean.toFixed(2);
    diffStdOutput = (data as IndicatorScore).diffStd.toFixed(2);

    if (projectedCompletion < currentYear && (data as IndicatorScore).score >= CUTOFF_DONE_PCT) {
      projectedCompletionOutput = 'Attained';
    } else {
      projectedCompletionOutput =
        projectedCompletion < 0 ? 'Never' : projectedCompletion.toFixed(1);
    }

    if (bestCompletion < currentYear && (data as IndicatorScore).score >= CUTOFF_DONE_PCT) {
      bestCompletionOutput = 'Attained';
    } else {
      bestCompletionOutput = bestCompletion < 0 ? 'Never' : bestCompletion.toFixed(1);
    }

    if (worstCompletion < currentYear && (data as IndicatorScore).score >= CUTOFF_DONE_PCT) {
      worstCompletionOutput = 'Attained';
    } else {
      worstCompletionOutput = worstCompletion < 0 ? 'Never' : worstCompletion.toFixed(1);
    }
  }

  return (
    <Stack spacing={4} w={{ base: '800px', '2xl': '1350px' }}>
      <Wrap>
        <WrapItem>
          <GDCPlot
            currentYear={year}
            municipality={municipality}
            data={data}
            compareMunicipality={compareMunicipality}
            compareData={compareData}
          />
        </WrapItem>
        <WrapItem maxWidth="525px" minWidth="475px">
          <Table variant="simple">
            <Thead>
              <Tr pr="0">
                <Th minWidth="215px">Statistic</Th>
                {statsHeaders}
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Points as calculated according to the U4SSC scale.">
                    <Text decoration="underline dotted">U4SSC points</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {pointsOutput}
                </Td>
                {compPoints}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Current value in percent of goal reached.">
                    <Text decoration="underline dotted">Raw score</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {scoreOutput}
                </Td>
                {compScore}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model.">
                    <Text decoration="underline dotted">Projected completion</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {projectedCompletionOutput}
                </Td>
                {compCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Is the projected completion year less than the set deadline for this KPI?">
                    <Text decoration="underline dotted">Will complete within deadline?</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {willCompleteOutput}
                </Td>
                {compWillComplete}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The average per year change until ${year}`}>
                    <Text decoration="underline dotted">Overall trend</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">{`${(100.0 * data.currentCAGR).toFixed(2)} %`}</Td>
                {compCurrentCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip
                    label={`The average per year change required to reach the designated target from ${year} to the set deadline.`}
                  >
                    <Text decoration="underline dotted">Required trend</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">{`${requiredOutput} %`}</Td>
                {compRequiredCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The best per year change for all periods until ${year}.`}>
                    <Text decoration="underline dotted">Best trend</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {`${(100.0 * bestGrowth.value).toFixed(2)} %`}
                  <br />
                  {`(${bestGrowth.startYear} to ${bestGrowth.endYear})`}
                </Td>
                {compBestCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model when assuming the average yearly change is the best possible case encountered this far.">
                    <Text decoration="underline dotted">Best case completion</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {bestCompletionOutput}
                </Td>
                {compBestCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The worst per year change for all periods until ${year}.`}>
                    <Text decoration="underline dotted">Worst trend</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {`${(100.0 * worstGrowth.value).toFixed(2)} %`}
                  <br />
                  {`(${worstGrowth.startYear} to ${worstGrowth.endYear})`}
                </Td>
                {compWorstCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model when assuming the average yearly change is the worst possible case encountered this far.">
                    <Text decoration="underline dotted">Worst case completion</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {worstCompletionOutput}
                </Td>
                {compWorstCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Mean of all trends encountered.">
                    <Text decoration="underline dotted">Mean of trends</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">{`${(100.0 * data.trendMean).toFixed(2)} %`}</Td>
                {compTrendMean}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Standard deviation of trends encountered.">
                    <Text decoration="underline dotted">Standard deviation of trends</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">{`${(100.0 * data.trendStd).toFixed(2)} %`}</Td>
                {compTrendStd}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Mean of difference between actual values and the projected values (measure of model suitability).">
                    <Text decoration="underline dotted">Mean difference of estimated value</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {diffMeanOutput}
                </Td>
                {compMean}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Standard deviation of difference between actual values and the projected values.">
                    <Text decoration="underline dotted">
                      Standard deviation of difference from estimated value
                    </Text>
                  </Tooltip>
                </Td>
                <Td isNumeric pl="0">
                  {diffStdOutput}
                </Td>
                {compStd}
              </Tr>
            </Tbody>
          </Table>
        </WrapItem>
      </Wrap>
      {correlatedTable || loadCorrelatedButton}
    </Stack>
  );
};

GDCView.defaultProps = defaultProps;
export default GDCView;
