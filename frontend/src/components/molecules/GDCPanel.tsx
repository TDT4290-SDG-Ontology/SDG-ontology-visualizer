/* eslint-disable no-restricted-syntax, no-plusplus */

import { Stack, Text, Container, Button, Table, Tbody, Thead, Tr, Th, Td, Tooltip } from '@chakra-ui/react';
import React, { useState } from 'react';

import { IndicatorScore, CorrelatedKPI } from '../../types/gdcTypes';

import { getCorrelatedKPIs } from '../../api/gdc';
import u4sscKPIMap from '../../common/u4sscKPIMap';

import GDCPlot from '../atoms/GDCPlot';

const correlationLabel = (corr: number) => {
  // TODO: need to invert correlation number for 'INV_...' calculations.

  if (corr >= 0.7)
    return (
      <Tooltip label="An improvement in this KPI would lead to a similar improvement">
        <Text fontWeight="bold" color="green.600">
          Strong synergy
        </Text>
      </Tooltip>
    );
  if (corr >= 0.4)
    return (
      <Tooltip label="An improvement in this KPI would lead to a moderate improvement">
        <Text fontWeight="bold" color="green.600">
          Moderate synergy
        </Text>
      </Tooltip>
    );
  if (corr > 0.1)
    return (
      <Tooltip label="An improvement in this KPI would lead to a small improvement">
        <Text fontWeight="bold" color="green.600">
          Weak synergy
        </Text>
      </Tooltip>
    );

  if (corr <= -0.7)
    return (
      <Tooltip label="An improvement in this KPI would lead to a similar regression">
        <Text fontWeight="bold" color="red.600">
          Strong tradeoff
        </Text>
      </Tooltip>
    );
  if (corr <= -0.4)
    return (
      <Tooltip label="An improvement in this KPI would lead to a moderate regression">
        <Text fontWeight="bold" color="red.600">
          Moderate tradeoff
        </Text>
      </Tooltip>
    );
  if (corr < 0.1)
    return (      
      <Tooltip label="An improvement in this KPI would lead to a small regression">
        <Text fontWeight="bold" color="red.600">
          Weak tradeoff
        </Text>
      </Tooltip>
    );

  return <Text fontWeight="bold">Ambigouos</Text>;
};

type GDCPanelProps = {
  year: number;

  municipality: string;
  data: IndicatorScore;

  compareMunicipality?: string;
  compareData?: IndicatorScore;
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

  const bestGrowth = data.yearlyGrowth[data.yearlyGrowth.length - 1];
  const worstGrowth = data.yearlyGrowth[0];

  const projectedCompletion = +data.projectedCompletion.toFixed(1);

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
                const name = display === undefined ? <Td /> : <Td>{display.eng}</Td>;
                return (
                  <Tr key={kpi.kpi}>
                    <Td minWidth="175px">{kpi.kpi}</Td>
                    {name}
                    <Td>{correlationLabel(kpi.correlation)}</Td>
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
      <Button isLoading={isLoadingCorrelated} onClick={() => loadCorrelatedKPIs()}>
        Load correlated KPIs
      </Button>
    );
  }

  let statsHeaders = (<Th minWidth="155px" isNumeric>Value</Th>);
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
  if (compareData !== undefined) {
    const compBestGrowth = compareData.yearlyGrowth[compareData.yearlyGrowth.length - 1];
    const compWorstGrowth = compareData.yearlyGrowth[0];
    const compProjectedCompletion = +compareData.projectedCompletion.toFixed(1);

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

    compPoints = (<Td isNumeric>{compareData.points}</Td>);
    compScore = (<Td isNumeric>{compareData.score.toFixed(2)}</Td>);
    compCompletion = (<Td isNumeric>{compProjectedCompletion < 0 ? 'Never' : compProjectedCompletion}</Td>);
    compWillComplete = (<Td isNumeric>{compareData.willCompleteBeforeDeadline ? 'Yes' : 'No'}</Td>);
    compCurrentCAGR = (<Td isNumeric>{`${(100.0 * compareData.currentCAGR).toFixed(2)} %`}</Td>);
    compRequiredCAGR = (<Td isNumeric>{`${(100.0 * compareData.requiredCAGR).toFixed(2)} %`}</Td>);
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

    compMean = (<Td isNumeric>{compareData.diffMean.toFixed(2)}</Td>);
    compStd = (<Td isNumeric>{compareData.diffStd.toFixed(2)}</Td>);
  }

  return (
    <Stack spacing={4} w={{ base: '800px', '2xl': '1250px' }}>
      <Stack direction={['column', 'row']}>
        <GDCPlot
          currentYear={year}
          municipality={municipality}
          data={data}
          compareMunicipality={compareMunicipality}
          compareData={compareData}
        />
        <Container maxWidth="475px">
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
                <Td isNumeric>{data.points}</Td>
                {compPoints}
              </Tr>
              <Tr>
                <Td>Raw score</Td>
                <Td isNumeric>{data.score.toFixed(2)}</Td>
                {compScore}
              </Tr>
              <Tr>
                <Td>Projected completion</Td>
                <Td isNumeric>{projectedCompletion < 0 ? 'Never' : projectedCompletion}</Td>
                {compCompletion}
              </Tr>
              <Tr>
                <Td>Will complete within deadline?</Td>
                <Td isNumeric>{data.willCompleteBeforeDeadline ? 'Yes' : 'No'}</Td>
                {compWillComplete}
              </Tr>
              <Tr>
                <Td>Current trend</Td>
                <Td isNumeric>{`${(100.0 * data.currentCAGR).toFixed(2)} %`}</Td>
                {compCurrentCAGR}
              </Tr>
              <Tr>
                <Td>Required trend</Td>
                <Td isNumeric>
                  {`${
                  data.requiredCAGR ? (100.0 * data.requiredCAGR).toFixed(2) : 'N/A'
                } %`}
                </Td>
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
                <Td>Mean difference</Td>
                <Td isNumeric>{data.diffMean.toFixed(2)}</Td>                
                {compMean}
              </Tr>
              <Tr>
                <Td>Standard deviation of difference</Td>
                <Td isNumeric>{data.diffStd.toFixed(2)}</Td>
                {compStd}
              </Tr>
            </Tbody>
          </Table>
        </Container>
      </Stack>
      {correlatedTable || loadCorrelatedButton}
    </Stack>
  );
};

GDCView.defaultProps = defaultProps;
export default GDCView;
