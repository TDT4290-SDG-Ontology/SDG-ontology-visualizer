import { Flex, Heading, Stack, Text, Spinner, Container, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getGDCOutput } from '../../api/gdc';
import { GDCOutput, IndicatorScore } from '../../types/gdcTypes';

import GDCPlot from '../atoms/GDCPlot';

type GDCViewProps = {
  code: string;
  year: number;
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();
  const [indicatorArray, setIndicatorArray] = useState<Array<any>>();
  const [worstIndicators, setWorstIndicators] = useState<Array<any>>();

  const { code, year } = props;
  const WORST_COUNT = 5;

  const loadGDCOutput = async (muniCode: string, muniYear: number) => {
      const data = await getGDCOutput(muniCode, muniYear);
      setGDCInfo(data);
      if (data !== undefined) {
        setIndicatorArray(Array.from(data.indicators).sort((a, b) => {
          if (a[0] < b[0]) return -1;
          if (a[0] > b[0]) return 1;
          return 0;
        }));
        setWorstIndicators(Array.from(data.indicators).sort((a, b) => a[1].score - b[1].score).slice(0, WORST_COUNT));
      }
  };

  useEffect(() => {
    loadGDCOutput(code, year);
  }, []);

  const renderKPIAccordion = (displayKPI: string, score: IndicatorScore) => {
    const bestGrowth = score.yearlyGrowth[score.yearlyGrowth.length - 1];
    const worstGrowth = score.yearlyGrowth[0];

    return (
      <AccordionItem key={displayKPI}>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {displayKPI}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <GDCPlot data={score} currentYear={year} />
          <Container maxWidth={1200} minWidth={800}>
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Td>Indicator score</Td>
                  <Td isNumeric>{score.points}</Td>
                </Tr>
                <Tr>
                  <Td>Raw score</Td>
                  <Td isNumeric>{score.score.toFixed(2)}</Td>
                </Tr>
                <Tr>
                  <Td>Projected completion</Td>
                  <Td isNumeric>{+score.projectedCompletion.toFixed(1)}</Td>
                </Tr>
                <Tr>
                  <Td>Will complete within deadline?</Td>
                  <Td isNumeric>{score.willCompleteBeforeDeadline ? 'yes' : 'no'}</Td>
                </Tr>
                <Tr>
                  <Td>Current CAGR</Td>
                  <Td isNumeric>{`${(100.0 * score.currentCAGR).toFixed(2)} %`}</Td>
                </Tr>
                <Tr>
                  <Td>Required CAGR</Td>
                  <Td isNumeric>{`${(score.requiredCAGR) ? (100.0 * score.requiredCAGR).toFixed(2) : 0.0} %`}</Td>
                </Tr>
                <Tr>
                  <Td>Mean difference</Td>
                  <Td isNumeric>{score.diffMean.toFixed(2)}</Td>
                </Tr>
                <Tr>
                  <Td>Standard deviation of difference</Td>
                  <Td isNumeric>{score.diffStd.toFixed(2)}</Td>
                </Tr>
                <Tr>
                  <Td>{`Best CAGR (${bestGrowth.startYear} to ${bestGrowth.endYear})`}</Td>
                  <Td isNumeric>{`${(100.0 * bestGrowth.value).toFixed(2)} %`}</Td>
                </Tr>
                <Tr>
                  <Td>{`Worst CAGR (${worstGrowth.startYear} to ${worstGrowth.endYear})`}</Td>
                  <Td isNumeric>{`${(100.0 * worstGrowth.value).toFixed(2)} %`}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Container>
        </AccordionPanel>
      </AccordionItem>
    );
  };

  if (gdcInfo === undefined || year === undefined)
    return (
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
      >
        <Stack>
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="cyan.700"
          />
          <Text size="md">
            Loading...
          </Text>
        </Stack>
      </Flex>
    );

  return (
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
    >
      <Stack spacing="0">
        <Heading size="xl">
          Progress overview
        </Heading>
        <Container maxWidth={1200} minWidth={800}>
          <Accordion>
            <AccordionItem key='worst'>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Worst performing KPIs
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Accordion>
                  { worstIndicators && worstIndicators.map(([key, val]) => renderKPIAccordion(key, val))}      
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Container>
        <Heading>
          Per indicator breakdown
        </Heading>
        <Container maxWidth={1200} minWidth={800}>
          <Accordion>
            { indicatorArray && indicatorArray.map(([key, val]) => renderKPIAccordion(key, val))}
          </Accordion>
        </Container>
      </Stack>
    </Flex>
  );
};

export default GDCView;
