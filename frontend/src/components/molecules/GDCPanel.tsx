/* eslint-disable no-restricted-syntax, no-plusplus, no-nested-ternary */

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
  if (corr >= 0.7)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to a equivalent improvement in this KPI`}
      >
        <Text fontWeight="bold" color="green.600" decoration="underline dotted">
          Strong synergy
        </Text>
      </Tooltip>
    );
  if (corr >= 0.4)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to a moderate improvement in this KPI`}
      >
        <Text fontWeight="bold" color="green.600" decoration="underline dotted">
          Moderate synergy
        </Text>
      </Tooltip>
    );
  if (corr > 0.1)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to a small improvement in this KPI`}
      >
        <Text fontWeight="bold" color="green.600" decoration="underline dotted">
          Weak synergy
        </Text>
      </Tooltip>
    );

  if (corr <= -0.7)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to an equivalent regression in this KPI`}
      >
        <Text fontWeight="bold" color="red.600" decoration="underline dotted">
          Strong tradeoff
        </Text>
      </Tooltip>
    );
  if (corr <= -0.4)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to a moderate regression in this KPI`}
      >
        <Text fontWeight="bold" color="red.600" decoration="underline dotted">
          Moderate tradeoff
        </Text>
      </Tooltip>
    );
  if (corr < 0.1)
    return (
      <Tooltip
        label={`An improvement in the "${name}" KPI would lead to a small regression in this KPI`}
      >
        <Text fontWeight="bold" color="red.600" decoration="underline dotted">
          Weak tradeoff
        </Text>
      </Tooltip>
    );

  return <Text fontWeight="bold">Ambigouos</Text>;
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

  const projectedCompletion = dataIsIndicatorScore
    ? +(data as IndicatorScore).projectedCompletion.toFixed(1)
    : -1;

  let correlatedTable = null;
  if (correlatedKPIs !== undefined) {
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

    statsHeaders = (
      <>
        <Th minWidth="155px" isNumeric>
          {municipality}
        </Th>
        <Th minWidth="155px" isNumeric>
          {compareMunicipality}
        </Th>
      </>
    );

    const compPointsOutput = compareIsIndicatorScore
      ? (compareData as IndicatorScore).points
      : 'N/A';
    const compScoreOutput = compareIsIndicatorScore
      ? (compareData as IndicatorScore).score.toFixed(2)
      : 'N/A';
    const compWillCompleteOutput = compareIsIndicatorScore
      ? (compareData as IndicatorScore).willCompleteBeforeDeadline
        ? 'Yes'
        : 'No'
      : 'N/A';
    const compCurrentCAGROutput = (100.0 * compareData.currentCAGR).toFixed(2);
    const compRequiredCAGROutput = compareIsIndicatorScore
      ? (100.0 * (compareData as IndicatorScore).requiredCAGR).toFixed(2)
      : 'N/A';

    const compDiffMeanOutput = compareIsIndicatorScore
      ? (compareData as IndicatorScore).diffMean.toFixed(2)
      : 'N/A';
    const compDiffStdOutput = compareIsIndicatorScore
      ? (compareData as IndicatorScore).diffStd.toFixed(2)
      : 'N/A';

    compPoints = <Td isNumeric>{compPointsOutput}</Td>;
    compScore = <Td isNumeric>{compScoreOutput}</Td>;
    compCompletion = (
      <Td isNumeric>{compProjectedCompletion < 0 ? 'Never' : compProjectedCompletion}</Td>
    );
    compWillComplete = <Td isNumeric>{compWillCompleteOutput}</Td>;
    compCurrentCAGR = <Td isNumeric>{`${compCurrentCAGROutput} %`}</Td>;
    compRequiredCAGR = <Td isNumeric>{`${compRequiredCAGROutput} %`}</Td>;
    compBestCAGR = (
      <Td isNumeric>
        {`${(100.0 * compBestGrowth.value).toFixed(2)} %`}
        <br />
        {`(${compBestGrowth.startYear} to ${compBestGrowth.endYear})`}
      </Td>
    );
    compWorstCAGR = (
      <Td isNumeric>
        {`${(100.0 * compWorstGrowth.value).toFixed(2)} %`}
        <br />
        {`(${compWorstGrowth.startYear} to ${compWorstGrowth.endYear})`}
      </Td>
    );

    compMean = <Td isNumeric>{compDiffMeanOutput}</Td>;
    compStd = <Td isNumeric>{compDiffStdOutput}</Td>;
    compTrendMean = <Td isNumeric>{`${(100.0 * compareData.trendMean).toFixed(2)} %`}</Td>;
    compTrendStd = <Td isNumeric>{`${(100.0 * compareData.trendStd).toFixed(2)} %`}</Td>;
  }

  const pointsOutput = dataIsIndicatorScore ? (data as IndicatorScore).points : 'N/A';
  const scoreOutput = dataIsIndicatorScore ? (data as IndicatorScore).score.toFixed(2) : 'N/A';
  const willCompleteOutput = dataIsIndicatorScore
    ? (data as IndicatorScore).willCompleteBeforeDeadline
      ? 'Yes'
      : 'No'
    : 'N/A';
  const requiredOutput = dataIsIndicatorScore
    ? (100.0 * (data as IndicatorScore).requiredCAGR).toFixed(2)
    : 'N/A';
  const diffMeanOutput = dataIsIndicatorScore
    ? (data as IndicatorScore).diffMean.toFixed(2)
    : 'N/A';
  const diffStdOutput = dataIsIndicatorScore ? (data as IndicatorScore).diffStd.toFixed(2) : 'N/A';

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
        <WrapItem maxWidth="475px">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th minWidth="165px">Statistic</Th>
                {statsHeaders}
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>U4SSC points</Td>
                <Td isNumeric>{pointsOutput}</Td>
                {compPoints}
              </Tr>
              <Tr>
                <Td>Raw score</Td>
                <Td isNumeric>{scoreOutput}</Td>
                {compScore}
              </Tr>
              <Tr>
                <Td>Projected completion</Td>
                <Td isNumeric>{projectedCompletion < 0 ? 'Never' : projectedCompletion}</Td>
                {compCompletion}
              </Tr>
              <Tr>
                <Td>Will complete within deadline?</Td>
                <Td isNumeric>{willCompleteOutput}</Td>
                {compWillComplete}
              </Tr>
              <Tr>
                <Td>Overall trend</Td>
                <Td isNumeric>{`${(100.0 * data.currentCAGR).toFixed(2)} %`}</Td>
                {compCurrentCAGR}
              </Tr>
              <Tr>
                <Td>Required trend</Td>
                <Td isNumeric>{`${requiredOutput} %`}</Td>
                {compRequiredCAGR}
              </Tr>
              <Tr>
                <Td>Best trend</Td>
                <Td isNumeric>
                  {`${(100.0 * bestGrowth.value).toFixed(2)} %`}
                  <br />
                  {`(${bestGrowth.startYear} to ${bestGrowth.endYear})`}
                </Td>
                {compBestCAGR}
              </Tr>
              <Tr>
                <Td>Worst trend</Td>
                <Td isNumeric>
                  {`${(100.0 * worstGrowth.value).toFixed(2)} %`}
                  <br />
                  {`(${worstGrowth.startYear} to ${worstGrowth.endYear})`}
                </Td>
                {compWorstCAGR}
              </Tr>
              <Tr>
                <Td>Mean of trends</Td>
                <Td isNumeric>{`${(100.0 * data.trendMean).toFixed(2)} %`}</Td>
                {compTrendMean}
              </Tr>
              <Tr>
                <Td>Standard deviation of trends</Td>
                <Td isNumeric>{`${(100.0 * data.trendStd).toFixed(2)} %`}</Td>
                {compTrendStd}
              </Tr>
              <Tr>
                <Td>
                  <Tooltip label="Mean of difference between actual values and the projected values (measure of model suitability).">
                    <Text decoration="underline dotted">Mean difference</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric>{diffMeanOutput}</Td>
                {compMean}
              </Tr>
              <Tr>
                <Td>
                  <Tooltip label="Standard deviation of difference between actual values and the projected values.">
                    <Text decoration="underline dotted">Standard deviation of difference</Text>
                  </Tooltip>
                </Td>
                <Td isNumeric>{diffStdOutput}</Td>
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
