import { Flex, Heading, Stack, Text, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getGDCOutput } from '../../api/gdc';
import { GDCOutput } from '../../types/gdcTypes';

type GDCViewProps = {
  code: string;
  year: number;
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();

  const { code, year } = props;

  const loadGDCOutput = async (muniCode: string, muniYear: number) => {
      const data = await getGDCOutput(muniCode, muniYear);
      setGDCInfo(data);
  };

  useEffect(() => {
    loadGDCOutput(code, year);
  }, []);

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
        <Text size="md">
          LOL
          { year }
        </Text>
        <Accordion allowMultiple>
          <AccordionItem key="worst">
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Worst performing KPIs
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Text>Yobbo</Text>
            </AccordionPanel>
          </AccordionItem>
          { gdcInfo && gdcInfo.indicators && Array.from(gdcInfo.indicators).map(([key, val]) => (
            <AccordionItem key={key}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {key}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Text>{val.score}</Text>
              </AccordionPanel>
            </AccordionItem>
            ))}
        </Accordion>
      </Stack>
    </Flex>
  );
};

export default GDCView;
