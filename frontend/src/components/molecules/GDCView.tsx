import { Flex, Heading, Stack, Text, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from '@chakra-ui/react';
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

  const renderKPIAccordion = (displayKPI: string, score: IndicatorScore) => (
    <AccordionItem key={displayKPI}>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {displayKPI}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Text>{`Current year: ${year}`}</Text>
        <Text>{`Score: ${score.score}`}</Text>
        <GDCPlot data={score} currentYear={year} />
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
        <Accordion>
          <AccordionItem key="worst">
            <AccordionButton>
              <Box flex="1" textAlign="left">
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
        <Heading>
          Per indicator breakdown
        </Heading>
        <Accordion>
          { indicatorArray && indicatorArray.map(([key, val]) => renderKPIAccordion(key, val))}
        </Accordion>
      </Stack>
    </Flex>
  );
};

export default GDCView;
