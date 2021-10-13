/* eslint-disable no-restricted-syntax, no-plusplus */

import { Flex, Heading, Stack, Text, Spinner, Container, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Table, Tbody, Thead, Tr, Td, Th } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getGDCOutput } from '../../api/gdc';
import { GDCOutput, IndicatorScore } from '../../types/gdcTypes';

import GDCPanel from './GDCPanel';

type GDCViewProps = {
  code: string;
  year: number;
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();
  const [indicators, setIndicators] = useState<Map<string, IndicatorScore>>();
  const [worstIndicators, setWorstIndicators] = useState<Map<string, IndicatorScore>>();

  const { code, year } = props;
  const WORST_COUNT = 5;

  const loadGDCOutput = async (muniCode: string, muniYear: number) => {
      const data = await getGDCOutput(muniCode, muniYear);
      setGDCInfo(data);
      if (data !== undefined) {
        setIndicators(data.indicators);
        setWorstIndicators(new Map(Array.from(data.indicators).sort((a, b) => a[1].score - b[1].score).slice(0, WORST_COUNT)));
      }
  };

  useEffect(() => {
    loadGDCOutput(code, year);
  }, []);

  const renderKPIAccordion = (displayKPI: string, score: IndicatorScore) => (
    <AccordionItem key={`${displayKPI}`}>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {displayKPI}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <GDCPanel data={score} year={year} />
      </AccordionPanel>
    </AccordionItem>
  );

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

  let unreportedIndicatorsPanel = null;
  if (gdcInfo.unreportedIndicators.length > 0) {
    unreportedIndicatorsPanel = (
      <AccordionItem key='unreported'>
        <AccordionButton>
          <Box flex='1' textAlign='left'>
            Unreported KPIs
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Table>
            <Thead>
              <Tr>
                <Th>KPI</Th>
                <Th>Name</Th>
              </Tr>
            </Thead>
            <Tbody>
              { gdcInfo.unreportedIndicators.map((ind) => (
                <Tr>
                  <Td>{ind}</Td>
                </Tr>
                ))}
            </Tbody>
          </Table>      
        </AccordionPanel>
      </AccordionItem>
    );    
  }

  let indicatorsWithoutGoalsPanel = null;
  if (gdcInfo.indicatorsWithoutGoals.size > 0) {
    indicatorsWithoutGoalsPanel = (
      <AccordionItem key='unreported'>
        <AccordionButton>
          <Box flex='1' textAlign='left'>
            KPIs without goals
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Table>
            <Thead>
              <Tr>
                <Th>KPI</Th>
                <Th>Name</Th>
              </Tr>
            </Thead>
            <Tbody>
              { Array.from(gdcInfo.indicatorsWithoutGoals.keys()).map((ind) => (
                <Tr>
                  <Td>{ind}</Td>
                </Tr>
                ))}
            </Tbody>
          </Table>      
        </AccordionPanel>
      </AccordionItem>
    );    
  }

  return (
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
    >
      <Stack spacing="4">
        <Container 
          maxWidth={1600}
          minWidth={800}          
          bg='white'
          borderWidth='1px'
          borderRadius='0.5em'
          p='1.5em'
        >
          <Stack spacing='4'>
            <Heading size="xl">
              Progress overview
            </Heading>
            <Heading size="md">
              Issues
            </Heading>
            <Accordion allowToggle allowMultiple>
              <AccordionItem key='worst'>
                <AccordionButton>
                  <Box flex='1' textAlign='left'>
                    Worst performing KPIs
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Accordion allowToggle allowMultiple>
                    { worstIndicators && Array.from(worstIndicators).map(([key, val]) => renderKPIAccordion(key, val))}      
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
              {unreportedIndicatorsPanel}
              {indicatorsWithoutGoalsPanel}
            </Accordion>
          </Stack>
        </Container>
        <Container 
          maxWidth={1600}
          minWidth={800}          
          bg='white'
          borderWidth='1px'
          borderRadius='0.5em'
          p='1.5em'
        >
          <Stack spacing='4'>
            <Heading>
              Per indicator breakdown
            </Heading>
            <Accordion allowToggle allowMultiple>
              { indicators && Array.from(indicators).map(([key, val]) => renderKPIAccordion(key, val))}
            </Accordion>
          </Stack>
        </Container>
      </Stack>
    </Flex>
  );
};

export default GDCView;
