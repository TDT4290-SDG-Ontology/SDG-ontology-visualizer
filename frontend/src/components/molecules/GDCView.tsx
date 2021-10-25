import {
  Flex,
  Heading,
  Stack,
  Text,
  Spinner,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getGDCOutput } from '../../api/gdc';
import { GDCOutput, IndicatorScore, IndicatorWithoutGoal } from '../../types/gdcTypes';

import u4sscKPIMap from '../../common/u4sscKPIMap';

import GDCPanel from './GDCPanel';
import GDCSunburst from '../atoms/GDCSunburst';

type GDCViewProps = {
  year: number;

  municipality: string;
  municipalityCode: string;
  municipalityGoalOverride?: string;

  compareMunicipality?: string;
  compareCode?: string;
  compareGoalOverride?: string;
};

const defaultProps = {
  compareMunicipality: undefined,
  compareCode: undefined,

  municipalityGoalOverride: undefined,
  compareGoalOverride: undefined,
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();
  const [compareGdcInfo, setCompareGDCInfo] = useState<GDCOutput>();
  const [indicators, setIndicators] = useState<Map<string, IndicatorScore>>();
  const [worstIndicators, setWorstIndicators] = useState<Map<string, IndicatorScore>>();
  const [longestCompletionIndicators, setLongestCompletionIndicators] =
    useState<Map<string, IndicatorScore>>();

  const {
    year,
    municipality,
    municipalityCode,
    compareMunicipality,
    compareCode,
    municipalityGoalOverride,
    compareGoalOverride,
  } = props;
  const WORST_COUNT = 15;

  const loadGDCOutput = async (muniCode: string, muniYear: number) => {
    if (muniYear === -1) return;

    if (compareCode !== undefined) {
      const data = await Promise.all([
        getGDCOutput(muniCode, muniYear, municipalityGoalOverride),
        getGDCOutput(compareCode, muniYear, compareGoalOverride),
      ]);
      setGDCInfo(data[0]);
      if (data[0] !== undefined) {
        setIndicators(data[0].indicators);
        setWorstIndicators(
          new Map(
            Array.from(data[0].indicators)
              .sort((a, b) => a[1].score - b[1].score)
              .slice(0, WORST_COUNT),
          ),
        );

        setLongestCompletionIndicators(
          new Map(
            Array.from(data[0].indicators)
              .sort((a, b) => {
                if (a[1].projectedCompletion === -1 && b[1].projectedCompletion > 0) return -1;
                if (b[1].projectedCompletion === -1 && a[1].projectedCompletion > 0) return 1;

                return b[1].projectedCompletion - a[1].projectedCompletion;
              })
              .slice(0, WORST_COUNT),
          ),
        );
      }

      setCompareGDCInfo(data[1]);
    } else {
      const data = await getGDCOutput(muniCode, muniYear);
      setGDCInfo(data);
      if (data !== undefined) {
        setIndicators(data.indicators);
        setWorstIndicators(
          new Map(
            Array.from(data.indicators)
              .sort((a, b) => a[1].score - b[1].score)
              .slice(0, WORST_COUNT),
          ),
        );

        setLongestCompletionIndicators(
          new Map(
            Array.from(data.indicators)
              .sort((a, b) => {
                if (a[1].projectedCompletion === -1 && b[1].projectedCompletion > 0) return -1;
                if (b[1].projectedCompletion === -1 && a[1].projectedCompletion > 0) return 1;

                return b[1].projectedCompletion - a[1].projectedCompletion;
              })
              .slice(0, WORST_COUNT),
          ),
        );
      }
    }
  };

  useEffect(() => {
    loadGDCOutput(municipalityCode, year);
  }, []);

  const renderKPIAccordion = (displayKPI: string, score: IndicatorScore | IndicatorWithoutGoal) => {
    const display = u4sscKPIMap.get(displayKPI);
    if (display === undefined) return null;

    let compareIndicator: IndicatorScore | IndicatorWithoutGoal | undefined;
    if (compareGdcInfo !== undefined) {
      compareIndicator = compareGdcInfo.indicators.get(displayKPI);
      if (compareIndicator === undefined)
        compareIndicator = compareGdcInfo.indicatorsWithoutGoals.get(displayKPI);
    }

    return (
      <AccordionItem key={`${displayKPI}`}>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {`${score.kpi} - ${display.eng}`}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <GDCPanel
            municipality={municipality}
            data={score}
            year={year}
            compareMunicipality={compareMunicipality}
            compareData={compareIndicator}
          />
        </AccordionPanel>
      </AccordionItem>
    );
  };

  if (gdcInfo === undefined || year === undefined || year === -1)
    return (
      <Flex align="center" justify="center" justifyContent="space-evenly">
        <Stack>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="cyan.700" />
          <Text size="md">Loading...</Text>
        </Stack>
      </Flex>
    );

  let unreportedIndicatorsPanel = null;
  if (gdcInfo.unreportedIndicators.length > 0) {
    unreportedIndicatorsPanel = (
      <AccordionItem key="unreported">
        <AccordionButton>
          <Box flex="1" textAlign="left">
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
              {gdcInfo.unreportedIndicators.map((ind) => {
                const display = u4sscKPIMap.get(ind);
                const name = display === undefined ? null : <Td>{display.eng}</Td>;
                return (
                  <Tr key={`${ind}`}>
                    <Td>{ind}</Td>
                    {name}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </AccordionPanel>
      </AccordionItem>
    );
  }

  let indicatorsWithoutGoalsPanel = null;
  if (gdcInfo.indicatorsWithoutGoals.size > 0) {
    indicatorsWithoutGoalsPanel = (
      <AccordionItem key="unreported">
        <AccordionButton>
          <Box flex="1" textAlign="left">
            KPIs without goals
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Accordion allowToggle allowMultiple>
            {Array.from(gdcInfo.indicatorsWithoutGoals).map(([key, val]) =>
              renderKPIAccordion(key, val),
            )}
          </Accordion>
        </AccordionPanel>
      </AccordionItem>
    );
  }

  let compareSunburst = null;
  if (compareGdcInfo !== undefined)
    compareSunburst = (
      <WrapItem>
        <GDCSunburst municipality={compareMunicipality!} gdc={compareGdcInfo} />
      </WrapItem>
    );

  return (
    <Flex align="center" justify="center" justifyContent="space-evenly">
      <Stack spacing="4" bg="white">
        <Container maxWidth={1600} minWidth={800} w={{ base: '900px', '2xl': '1420px' }} p="1em">
          <Stack spacing="4">
            <Heading size="xl">Progress overview</Heading>
            <Container>
              <Wrap w={{ base: '900px', '2xl': '1356px' }} justify="center" spacing="10">
                <WrapItem>
                  <GDCSunburst municipality={municipality} gdc={gdcInfo} showLegend />
                </WrapItem>
                {compareSunburst}
              </Wrap>
            </Container>
            <Heading size="md">Issues</Heading>
            <Accordion allowToggle allowMultiple>
              <AccordionItem key="worst-score">
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Worst performing KPIs (by score)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Accordion allowToggle allowMultiple>
                    {worstIndicators &&
                      Array.from(worstIndicators).map(([key, val]) => renderKPIAccordion(key, val))}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem key="worst-completion">
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Worst performing KPIs (by projected completion year)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Accordion allowToggle allowMultiple>
                    {longestCompletionIndicators &&
                      Array.from(longestCompletionIndicators).map(([key, val]) =>
                        renderKPIAccordion(key, val),
                      )}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
              {unreportedIndicatorsPanel}
              {indicatorsWithoutGoalsPanel}
            </Accordion>
          </Stack>
        </Container>
        <Container maxWidth={1600} minWidth={800} p="1em">
          <Stack spacing="4">
            <Heading>Per indicator breakdown</Heading>
            <Accordion allowToggle allowMultiple>
              {indicators &&
                Array.from(indicators)
                  .sort((a, b) => {
                    if (a[0] < b[0]) return -1;
                    if (b[0] < a[0]) return 1;
                    return 0;
                  })
                  .map(([key, val]) => renderKPIAccordion(key, val))}
            </Accordion>
          </Stack>
        </Container>
      </Stack>
    </Flex>
  );
};

GDCView.defaultProps = defaultProps;
export default GDCView;
