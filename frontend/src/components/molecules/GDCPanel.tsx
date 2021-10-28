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

  const populateTableCells = (score: IndicatorScore | IndicatorWithoutGoal | undefined) => {
    if (score === undefined) {
      return {
        points: null,
        score: null,
        projectedCompletion: null,
        willComplete: null,
        currentCAGR: null,
        requiredCAGR: null,

        bestCAGR: null,
        bestCompletion: null,

        worstCAGR: null,
        worstCompletion: null,

        diffMean: null,
        diffStd: null,
        trendMean: null,
        trendStd: null,
      };
    }

    const isIndicatorScore = (score as IndicatorScore).goal !== undefined;

    const dummyGrowth = { value: 0, startYear: year, endYear: year };
    const bestGrowth =
      score.yearlyGrowth.length > 0
        ? score.yearlyGrowth[score.yearlyGrowth.length - 1]
        : dummyGrowth;
    const worstGrowth = score.yearlyGrowth.length > 0 ? score.yearlyGrowth[0] : dummyGrowth;

    let pointsOutput: number | string = 'N/A';
    let scoreOutput: number | string = 'N/A';
    let projectedCompletionOutput: number | string = 'N/A';
    let willCompleteOutput: number | string = 'N/A';
    let requiredCAGROutput: number | string = 'N/A';
    let diffMeanOutput: number | string = 'N/A';
    let diffStdOutput: number | string = 'N/A';
    let bestCompletionOutput: number | string = 'N/A';
    let worstCompletionOutput: number | string = 'N/A';

    const currentCAGROutput = (100.0 * score.currentCAGR).toFixed(2);

    if (isIndicatorScore) {
      const currentYear = score.historicalData[score.historicalData.length - 1].year;

      pointsOutput = (score as IndicatorScore).points;
      scoreOutput = (score as IndicatorScore).score.toFixed(2);
      willCompleteOutput = (score as IndicatorScore).willCompleteBeforeDeadline ? 'Yes' : 'No';

      if (currentYear < (score as IndicatorScore).goal.deadline) {
        requiredCAGROutput = (100.0 * (score as IndicatorScore).requiredCAGR).toFixed(2);
      }

      diffMeanOutput = (score as IndicatorScore).diffMean.toFixed(2);
      diffStdOutput = (score as IndicatorScore).diffStd.toFixed(2);

      if (score.historicalData.length > 1) {
        const currentValue = score.historicalData[score.historicalData.length - 1].value;

        let bestCompletionYear =
          currentYear +
          Math.log((score as IndicatorScore).goal.target / currentValue) /
            Math.log(bestGrowth.value + 1.0);

        let worstCompletionYear =
          currentYear +
          Math.log((score as IndicatorScore).goal.target / currentValue) /
            Math.log(worstGrowth.value + 1.0);

        // If the completion dates are in the past, double check against score to make sure
        // they acutally are completed, and the municipality isn't just doing *extremely* badly!
        if (bestCompletionYear < currentYear && (score as IndicatorScore).score < CUTOFF_DONE_PCT)
          bestCompletionYear = -1;

        if (worstCompletionYear < currentYear && (score as IndicatorScore).score < CUTOFF_DONE_PCT)
          worstCompletionYear = -1;

        if (
          (score as IndicatorScore).projectedCompletion < currentYear &&
          (score as IndicatorScore).score >= CUTOFF_DONE_PCT
        ) {
          projectedCompletionOutput = 'Attained';
        } else {
          projectedCompletionOutput =
            (score as IndicatorScore).projectedCompletion < 0
              ? 'Never'
              : (score as IndicatorScore).projectedCompletion.toFixed(0);
        }

        if (
          bestCompletionYear < currentYear &&
          (score as IndicatorScore).score >= CUTOFF_DONE_PCT
        ) {
          bestCompletionOutput = 'Attained';
        } else {
          bestCompletionOutput = bestCompletionYear < 0 ? 'Never' : bestCompletionYear.toFixed(0);
        }

        if (
          worstCompletionYear < currentYear &&
          (score as IndicatorScore).score >= CUTOFF_DONE_PCT
        ) {
          worstCompletionOutput = 'Attained';
        } else {
          worstCompletionOutput =
            worstCompletionYear < 0 ? 'Never' : worstCompletionYear.toFixed(0);
        }
      }
    }

    return {
      points: (
        <Td isNumeric pl="0">
          {pointsOutput}
        </Td>
      ),
      score: (
        <Td isNumeric pl="0">
          {scoreOutput}
        </Td>
      ),
      projectedCompletion: (
        <Td isNumeric pl="0">
          {projectedCompletionOutput}
        </Td>
      ),
      willComplete: (
        <Td isNumeric pl="0">
          {willCompleteOutput}
        </Td>
      ),
      currentCAGR: <Td isNumeric pl="0">{`${currentCAGROutput} %`}</Td>,
      requiredCAGR: <Td isNumeric pl="0">{`${requiredCAGROutput} %`}</Td>,

      bestCAGR: (
        <Td isNumeric pl="0">
          {`${(100.0 * bestGrowth.value).toFixed(2)} %`}
          <br />
          {`(${bestGrowth.startYear} to ${bestGrowth.endYear})`}
        </Td>
      ),
      bestCompletion: (
        <Td isNumeric pl="0">
          {bestCompletionOutput}
        </Td>
      ),

      worstCAGR: (
        <Td isNumeric pl="0">
          {`${(100.0 * worstGrowth.value).toFixed(2)} %`}
          <br />
          {`(${worstGrowth.startYear} to ${worstGrowth.endYear})`}
        </Td>
      ),
      worstCompletion: (
        <Td isNumeric pl="0">
          {worstCompletionOutput}
        </Td>
      ),

      diffMean: (
        <Td isNumeric pl="0">
          {diffMeanOutput}
        </Td>
      ),
      diffStd: (
        <Td isNumeric pl="0">
          {diffStdOutput}
        </Td>
      ),
      trendMean: <Td isNumeric pl="0">{`${(100.0 * score.trendMean).toFixed(2)} %`}</Td>,
      trendStd: <Td isNumeric pl="0">{`${(100.0 * score.trendStd).toFixed(2)} %`}</Td>,
    };
  };

  let statsHeaders = (
    <Th minWidth="155px" isNumeric pl="0">
      Value
    </Th>
  );
  if (compareData !== undefined) {
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
  }

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

  const compareOutput = populateTableCells(compareData);
  const muniOutput = populateTableCells(data);

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
                {muniOutput.points}
                {compareOutput.points}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Current value in percent of goal reached.">
                    <Text decoration="underline dotted">Raw score</Text>
                  </Tooltip>
                </Td>
                {muniOutput.score}
                {compareOutput.score}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model.">
                    <Text decoration="underline dotted">Projected completion</Text>
                  </Tooltip>
                </Td>
                {muniOutput.projectedCompletion}
                {compareOutput.projectedCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Is the projected completion year less than the set deadline for this KPI?">
                    <Text decoration="underline dotted">Will complete within deadline?</Text>
                  </Tooltip>
                </Td>
                {muniOutput.willComplete}
                {compareOutput.willComplete}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The average per year change until ${year}`}>
                    <Text decoration="underline dotted">Overall trend</Text>
                  </Tooltip>
                </Td>
                {muniOutput.currentCAGR}
                {compareOutput.currentCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip
                    label={`The average per year change required to reach the designated target from ${year} to the set deadline.`}
                  >
                    <Text decoration="underline dotted">Required trend</Text>
                  </Tooltip>
                </Td>
                {muniOutput.requiredCAGR}
                {compareOutput.requiredCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The best per year change for all periods until ${year}.`}>
                    <Text decoration="underline dotted">Best trend</Text>
                  </Tooltip>
                </Td>
                {muniOutput.bestCAGR}
                {compareOutput.bestCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model when assuming the average yearly change is the best possible case encountered this far.">
                    <Text decoration="underline dotted">Best case completion</Text>
                  </Tooltip>
                </Td>
                {muniOutput.bestCompletion}
                {compareOutput.bestCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label={`The worst per year change for all periods until ${year}.`}>
                    <Text decoration="underline dotted">Worst trend</Text>
                  </Tooltip>
                </Td>
                {muniOutput.worstCAGR}
                {compareOutput.worstCAGR}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Estimated completion year (including fraction) according to the prediction model when assuming the average yearly change is the worst possible case encountered this far.">
                    <Text decoration="underline dotted">Worst case completion</Text>
                  </Tooltip>
                </Td>
                {muniOutput.worstCompletion}
                {compareOutput.worstCompletion}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Mean of all trends encountered.">
                    <Text decoration="underline dotted">Mean of trends</Text>
                  </Tooltip>
                </Td>
                {muniOutput.trendMean}
                {compareOutput.trendMean}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Standard deviation of trends encountered.">
                    <Text decoration="underline dotted">Standard deviation of trends</Text>
                  </Tooltip>
                </Td>
                {muniOutput.trendStd}
                {compareOutput.trendStd}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Mean of difference between actual values and the projected values (measure of model suitability).">
                    <Text decoration="underline dotted">Mean difference of estimated value</Text>
                  </Tooltip>
                </Td>
                {muniOutput.diffMean}
                {compareOutput.diffMean}
              </Tr>
              <Tr>
                <Td pr="0">
                  <Tooltip label="Standard deviation of difference between actual values and the projected values.">
                    <Text decoration="underline dotted">
                      Standard deviation of difference from estimated value
                    </Text>
                  </Tooltip>
                </Td>
                {muniOutput.diffStd}
                {compareOutput.diffStd}
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
