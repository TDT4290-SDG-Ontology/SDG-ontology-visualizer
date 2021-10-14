/* eslint-disable no-restricted-syntax, no-plusplus */

import { Stack, Text, Container, Button, Table, Tbody,  Thead,  Tr,  Th,  Td } from '@chakra-ui/react';
import React, { useState } from 'react';

import { IndicatorScore, CorrelatedKPI } from '../../types/gdcTypes';

import { getCorrelatedKPIs } from '../../api/gdc';

import GDCPlot from '../atoms/GDCPlot';

const correlationLabel = (corr: number) => {
  if (corr >= 0.7) return (<Text fontWeight="bold" color="green.600">Strong synergy</Text>);
  if (corr >= 0.4) return (<Text fontWeight="bold" color="green.600">Moderate synergy</Text>);
  if (corr > 0.1) return (<Text fontWeight="bold" color="green.600">Weak synergy</Text>);

  if (corr <= -0.7) return (<Text fontWeight="bold" color="red.600">Strong tradeoff</Text>);
  if (corr <= -0.4) return (<Text fontWeight="bold" color="red.600">Moderate tradeoff</Text>);
  if (corr <   0.1) return (<Text fontWeight="bold" color="red.600">Weak tradeoff</Text>);

  return (<Text fontWeight="bold">Ambigouos</Text>);
};

type GDCPanelProps = {
  data: IndicatorScore;
  year: number;
};

const GDCView: React.FC<GDCPanelProps> = (props: GDCPanelProps) => {
  const [isLoadingCorrelated, setLoadingCorrelated] = useState<boolean>(false);
  const [correlatedKPIs, setCorrelatedKPIs] = useState<CorrelatedKPI[]>();

  const { data, year } = props;

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
        <Container minWidth='800px'>
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
        <Container maxWidth={1200} minWidth={800}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>KPI</Th>
                <Th>Strength</Th>
                <Th>From SDG target</Th>
              </Tr>
            </Thead>
            <Tbody>
              { correlatedKPIs.map((kpi) => (
                <Tr>
                  <Td>{kpi.kpi}</Td>
                  <Td>{correlationLabel(kpi.correlation)}</Td>
                  <Td>{kpi.subgoal}</Td>
                </Tr>
                ))}
            </Tbody>
          </Table>
        </Container>
      );
    }
  }
  

  let loadCorrelatedButton = null;
  if (correlatedKPIs === undefined) {
    loadCorrelatedButton = (<Button isLoading={isLoadingCorrelated} onClick={() => loadCorrelatedKPIs()}>Load correlated KPIs</Button>);
  }

  return (
    <Stack 
      spacing={4}
      w={{ base: '800px', '2xl': '1250px' }}  
    > 
      <Stack direction={['column', 'row']}>
        <GDCPlot data={data} currentYear={year} />
        <Container maxWidth='350px'>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Statistic</Th>
                <Th minWidth='120px' isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>U4SSC points</Td>
                <Td isNumeric>{data.points}</Td>
              </Tr>
              <Tr>
                <Td>Raw score</Td>
                <Td isNumeric>{data.score.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td>Projected completion</Td>
                <Td isNumeric>{(projectedCompletion < 0) ? 'Never' : projectedCompletion}</Td>
              </Tr>
              <Tr>
                <Td>Will complete within deadline?</Td>
                <Td isNumeric>{data.willCompleteBeforeDeadline ? 'Yes' : 'No'}</Td>
              </Tr>
              <Tr>
                <Td>Current CAGR</Td>
                <Td isNumeric>{`${(100.0 * data.currentCAGR).toFixed(2)} %`}</Td>
              </Tr>
              <Tr>
                <Td>Required CAGR</Td>
                <Td isNumeric>{`${(data.requiredCAGR) ? (100.0 * data.requiredCAGR).toFixed(2) : 'N/A'} %`}</Td>
              </Tr>
              <Tr>
                <Td>{`Best CAGR\n(${bestGrowth.startYear} to ${bestGrowth.endYear})`}</Td>
                <Td isNumeric>{`${(100.0 * bestGrowth.value).toFixed(2)} %`}</Td>
              </Tr>
              <Tr>
                <Td>{`Worst CAGR (${worstGrowth.startYear} to ${worstGrowth.endYear})`}</Td>
                <Td isNumeric>{`${(100.0 * worstGrowth.value).toFixed(2)} %`}</Td>
              </Tr>
              <Tr>
                <Td>Mean difference</Td>
                <Td isNumeric>{data.diffMean.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td>Standard deviation of difference</Td>
                <Td isNumeric>{data.diffStd.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Container>
      </Stack>
      { correlatedTable || loadCorrelatedButton }
    </Stack>
  );
};

export default GDCView;
