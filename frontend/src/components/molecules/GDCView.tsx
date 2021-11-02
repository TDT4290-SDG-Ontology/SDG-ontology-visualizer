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

/* prettier-ignore */
const indicatorDisplayHierarchy = [
  { 
    name: 'Economy', 
    categories: [
      { 
        name: 'ICT',
        kpis: [ 
          'EC: ICT: ICT: 1C', 
          'EC: ICT: ICT: 2C', 
          'EC: ICT: ICT: 3C',
          'EC: ICT: ICT: 4C - 3g',
          'EC: ICT: ICT: 4C - 4g',
          'EC: ICT: ICT: 5C',
        ],
      }, 
      { 
        name: 'Water and Sanitation',
        kpis: [
          'EC: ICT: WS: 1C',
          'EC: ICT: WS: 2A',
          'EC: I: WS: 1C',
          'EC: I: WS: 2C',
          'EC: I: WS: 3C',
          'EC: I: WS: 4C',
          'EC: I: WS: 5C',
        ],
      },   
      { 
        name: 'Drainage',
        kpis: [ 'EC: ICT: D: 1A' ],
      }, 
      { 
        name: 'Electricity Supply',
        kpis: [
            'EC: ICT: ES: 1C',
            'EC: ICT: ES: 2A',
            'EC: ICT: ES: 3A',
            'EC: I: ES: 1C',
            'EC: I: ES: 2C',
            'EC: I: ES: 3C',
        ],
      }, 
      { 
        name: 'Transport',
        kpis: [
          'EC: ICT: T: 1C',
          'EC: ICT: T: 2C',
          'EC: ICT: T: 3A',
          'EC: I: T: 1C',
          'EC: I: T: 2A',
          'EC: I: T: 3C',
          'EC: I: T: 4A - private',
          'EC: I: T: 4A - public',
          'EC: I: T: 4A - walking',
          'EC: I: T: 4A - cycling',
          'EC: I: T: 4A - para',
          'EC: I: T: 5A',
          'EC: I: T: 6A',
          'EC: I: T: 7A',
          'EC: I: T: 8A',
        ],
      }, 
      { 
        name: 'Public Service',
        kpis: [
          'EC: ICT: PS: 1A - number',
          'EC: ICT: PS: 1A - percent',
          'EC: ICT: PS: 2A',
          'EC: ICT: PS: 3A',
        ],
      }, 
      { 
        name: 'Innovation',
        kpis: [
          'EC: P: IN: 1C',
          'EC: P: IN: 2C',
          'EC: P: IN: 3A',
        ],
      },
      { 
        name: 'Employment',
        kpis: [
          'EC: P: EM: 1C',
          'EC: P: EM: 2C',
          'EC: P: EM: 3A',
          'EC: P: EM: 4A',
        ],
      },
      { 
        name: 'Waste',
        kpis: [ 'EC: I: WA: 1C' ],
      },  
      { 
        name: 'Buildings',
        kpis: [
          'EC: I: B: 1A',
          'EC: I: B: 2A',
        ],
      },  
      { 
        name: 'Urban Planning',
        kpis: [
          'EC: I: UP: 1A',
          'EC: I: UP: 2A - compact', 
          'EC: I: UP: 2A - connected', 
          'EC: I: UP: 2A - integrated', 
          'EC: I: UP: 2A - inclusive', 
          'EC: I: UP: 2A - resilient',
        ],
      },   
    ],
  },
  { 
    name: 'Environment',
    categories: [
      { 
        name: 'Air Quality',
        kpis: [
          'EN: EN: AQ: 1C - pm_2.5',
          'EN: EN: AQ: 1C - pm_10',
          'EN: EN: AQ: 1C - no2',
          'EN: EN: AQ: 1C - so2',
          'EN: EN: AQ: 1C - o3',
          'EN: EN: AQ: 2C',
        ],
      }, 
      { 
        name: 'Water and Sanitation',
        kpis: [
          'EN: EN: WS: 1C',
          'EN: EN: WS: 2C',
          'EN: EN: WS: 3C',
          'EN: EN: WS: 4C - primary',
          'EN: EN: WS: 4C - secondary',
          'EN: EN: WS: 4C - tertiary',
        ],
      },
      { 
        name: 'Waste',
        kpis: [
          'EN: EN: WA: 1C - landfill',
          'EN: EN: WA: 1C - burnt',
          'EN: EN: WA: 1C - incinerated',
          'EN: EN: WA: 1C - open_dump',
          'EN: EN: WA: 1C - recycled',
          'EN: EN: WA: 1C - other',
        ],
      },
      { 
        name: 'Environmental Quality',
        kpis: [
          'EN: EN: EQ: 1C',
          'EN: EN: EQ: 2A',
        ],
      },
      { 
        name: 'Public Space and Nature',
        kpis: [      
          'EN: EN: PSN: 1C',
          'EN: EN: PSN: 2A',
          'EN: EN: PSN: 3A',
          'EN: EN: PSN: 4A',
        ],
      },
      { 
        name: 'Energy',
        kpis: [
          'EN: E: E: 1C',
          'EN: E: E: 2C',
          'EN: E: E: 3C',
          'EN: E: E: 4A',
        ],
      },
    ],
  },
  { 
    name: 'Society',
    categories: [
      { 
        name: 'Education',
        kpis: [
          'SC: EH: ED: 1C',
          'SC: EH: ED: 2C',
          'SC: EH: ED: 3C',
          'SC: EH: ED: 4C',
        ],
      },
      { 
        name: 'Health',
        kpis: [
          'SC: EH: ED: 5A',
          'SC: EH: H: 1C',
          'SC: EH: H: 2C',
          'SC: EH: H: 3C',
          'SC: EH: H: 5A',
          'SC: EH: H: 4A',
        ],
      },
      { 
        name: 'Culture',
        kpis: [
          'SC: EH: C: 1C',
          'SC: EH: C: 2A',
        ],
      },
      { 
        name: 'Housing',
        kpis: [          
          'SC: SH: HO: 1C',
          'SC: SH: HO: 2A',
        ],
      },
      { 
        name: 'Social Inclusion',
        kpis: [
          'SC: SH: SI: 1C',
          'SC: SH: SI: 2C',
          'SC: SH: SI: 3C',
          'SC: SH: SI: 4C',
          'SC: SH: SI: 5A',
        ],
      },
      { 
        name: 'Safety',
        kpis: [          
          'SC: SH: SA: 1C',
          'SC: SH: SA: 2C',
          'SC: SH: SA: 3A',
          'SC: SH: SA: 4A',
          'SC: SH: SA: 5A',
          'SC: SH: SA: 6C',
          'SC: SH: SA: 7C',
          'SC: SH: SA: 8C',
          'SC: SH: SA: 9C',
        ],
      },
      { 
        name: 'Food Security',
        kpis: [ 'SC: SH: FS: 1A' ],
      }, 
    ],
  },
];

type GDCViewProps = {
  year: number;

  municipality: string;
  municipalityCode: string;
  municipalityGoalOverride?: string;

  compareMunicipality?: string;
  compareCode?: string;
  compareGoalOverride?: string;
  overrideMode?: string;
};

const defaultProps = {
  compareMunicipality: undefined,
  compareCode: undefined,

  municipalityGoalOverride: undefined,
  compareGoalOverride: undefined,
  overrideMode: undefined,
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();
  const [compareGdcInfo, setCompareGDCInfo] = useState<GDCOutput>();
  const [indicators, setIndicators] = useState<Map<string, IndicatorScore>>();
  const [worstIndicators, setWorstIndicators] = useState<Map<string, IndicatorScore>>();
  const [bestIndicators, setBestIndicators] = useState<Map<string, IndicatorScore>>();
  const [longestCompletionIndicators, setLongestCompletionIndicators] =
    useState<Map<string, IndicatorScore>>();
  const [shortestCompletionIndicators, setShortestCompletionIndicators] =
    useState<Map<string, IndicatorScore>>();

  const {
    year,
    municipality,
    municipalityCode,
    compareMunicipality,
    compareCode,
    municipalityGoalOverride,
    compareGoalOverride,
    overrideMode,
  } = props;
  const WORST_COUNT = 15;

  const loadGDCOutput = async (muniCode: string, muniYear: number) => {
    if (muniYear === -1) return;

    const CUTOFF_DONE_PCT = 99.5;

    if (compareCode !== undefined) {
      const data = await Promise.all([
        getGDCOutput(muniCode, muniYear, municipalityGoalOverride, overrideMode || 'absolute'),
        getGDCOutput(compareCode, muniYear, compareGoalOverride, overrideMode || 'absolute'),
      ]);
      setGDCInfo(data[0]);
      if (data[0] !== undefined) {
        setIndicators(data[0].indicators);

        const sortedByScore: Array<any> = Array.from(data[0].indicators).sort(
          (a, b) => a[1].score - b[1].score,
        );

        setWorstIndicators(new Map(sortedByScore.slice(0, WORST_COUNT)));
        setBestIndicators(new Map(Array.from(sortedByScore.slice(-WORST_COUNT)).reverse()));

        const sortedByCompletionYear = Array.from(data[0].indicators).sort((a, b) => {
          if (a[1].projectedCompletion === -1 && a[1].score >= CUTOFF_DONE_PCT) return -1;
          if (b[1].projectedCompletion === -1 && b[1].score >= CUTOFF_DONE_PCT) return 1;

          if (a[1].projectedCompletion === -1 && b[1].projectedCompletion > 0) return 1;
          if (b[1].projectedCompletion === -1 && a[1].projectedCompletion > 0) return -1;

          return a[1].projectedCompletion - b[1].projectedCompletion;
        });

        setShortestCompletionIndicators(new Map(sortedByCompletionYear.slice(0, WORST_COUNT)));
        setLongestCompletionIndicators(
          new Map(Array.from(sortedByCompletionYear.slice(-WORST_COUNT)).reverse()),
        );
      }

      setCompareGDCInfo(data[1]);
    } else {
      const data = await getGDCOutput(muniCode, muniYear);
      setGDCInfo(data);
      if (data !== undefined) {
        setIndicators(data.indicators);

        const sortedByScore: Array<any> = Array.from(data.indicators).sort(
          (a, b) => a[1].score - b[1].score,
        );

        setWorstIndicators(new Map(sortedByScore.slice(0, WORST_COUNT)));
        setBestIndicators(new Map(Array.from(sortedByScore.slice(-WORST_COUNT)).reverse()));

        const sortedByCompletionYear = Array.from(data.indicators).sort((a, b) => {
          if (a[1].projectedCompletion === -1 && a[1].score >= CUTOFF_DONE_PCT) return -1;
          if (b[1].projectedCompletion === -1 && b[1].score >= CUTOFF_DONE_PCT) return 1;

          if (a[1].projectedCompletion === -1 && b[1].projectedCompletion > 0) return 1;
          if (b[1].projectedCompletion === -1 && a[1].projectedCompletion > 0) return -1;

          return a[1].projectedCompletion - b[1].projectedCompletion;
        });

        setShortestCompletionIndicators(new Map(sortedByCompletionYear.slice(0, WORST_COUNT)));
        setLongestCompletionIndicators(
          new Map(Array.from(sortedByCompletionYear.slice(-WORST_COUNT)).reverse()),
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
      <AccordionItem key="without-goals">
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
        <Container maxWidth={1600} minWidth={800} w={{ base: '900px', '2xl': '1450px' }} p="1em">
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
            <Accordion allowToggle allowMultiple>
              <AccordionItem key="best-score">
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Best performing KPIs (by score)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Accordion allowToggle allowMultiple>
                    {bestIndicators &&
                      Array.from(bestIndicators).map(([key, val]) => renderKPIAccordion(key, val))}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem key="best-completion">
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Best performing KPIs (by projected completion year)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Accordion allowToggle allowMultiple>
                    {shortestCompletionIndicators &&
                      Array.from(shortestCompletionIndicators).map(([key, val]) =>
                        renderKPIAccordion(key, val),
                      )}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
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
            </Accordion>
            {(unreportedIndicatorsPanel || indicatorsWithoutGoalsPanel) && (
              <>
                <Heading size="xl">Issues</Heading>
                <Accordion allowToggle allowMultiple>
                  {unreportedIndicatorsPanel}
                  {indicatorsWithoutGoalsPanel}
                </Accordion>
              </>
            )}
          </Stack>
        </Container>
        <Container maxWidth={1600} minWidth={800} p="1em">
          <Stack spacing="4">
            <Heading>Per indicator breakdown</Heading>
            {indicators &&
              indicatorDisplayHierarchy.map((d) => (
                <div key={d.name}>
                  <Heading size="md" mb="0.5em">
                    {d.name}
                  </Heading>
                  <Accordion allowToggle allowMultiple>
                    {d.categories.map((c) => (
                      <AccordionItem key={c.name}>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            {c.name}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Accordion allowToggle allowMultiple>
                            {c.kpis.map((kpi) => {
                              const ind = indicators.get(kpi);
                              if (!ind) return null;
                              return renderKPIAccordion(kpi, ind);
                            })}
                          </Accordion>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
          </Stack>
        </Container>
        <Stack
          p="1em"
          w={{ base: '900px', '2xl': '1450px' }}
          justify="center"
          justifyContent="center"
          align="center"
          spacing="0"
        >
          <Text fontSize="xs" textAlign="center" w="100%">
            Correlation data is &copy; 2021
            {' '}
          </Text>
          <a target="_blank" rel="noreferrer" href="http://www.iges.or.jp/en/">
            <Text fontSize="xs" textAlign="center" w="100%" color="blue">
              Institute for Global Environmental Strategies (IGES), Japan
            </Text>
          </a>
          <Text fontSize="xs" textAlign="center" w="100%">
            All Rights Reserved, and is provided by the courtesy of the IGES SDG Interlinkages
            Analysis & Visualisation Tool (V4.0)
          </Text>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://sdginterlinkages.iges.jp/visualisationtool.html"
          >
            <Text fontSize="xs" textAlign="center" w="100%" color="blue">
              https://sdginterlinkages.iges.jp/visualisationtool.html
            </Text>
          </a>
        </Stack>
      </Stack>
    </Flex>
  );
};

GDCView.defaultProps = defaultProps;
export default GDCView;
