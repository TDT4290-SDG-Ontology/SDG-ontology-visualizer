import React, { useState, useEffect } from 'react';
import {
  Heading,
  Stack,
  Flex,
  Input,
  Button,
  Spacer,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  TabPanel,
  TabPanels,
  TabList,
  Select,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Checkbox,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Code,
  Table,
  Tr,
  Td,
  Th,
  Thead,
  Tbody,
  UnorderedList,
  ListItem,
  useToast,
} from '@chakra-ui/react';

import { useHistory } from 'react-router-dom';

import reducer from '../../state/store';
import { tokenVerified, tokenUnverified } from '../../state/reducers/loginReducer';

import { Municipality } from '../../types/municipalityTypes';

import { validateToken } from '../../api/auth';
import { getAllMunicipalities } from '../../api/municipalities';
import { uploadDataCSV } from '../../api/data';
import { uploadGoalCSV } from '../../api/gdc';

import U4SSC_KPI_NAMES from '../../common/u4sscKPIMap';

const CSVInfoMods = (
  <>
    The KPI id is the U4SSC KPI as defined in the
    <Code>
      Collection Methodology for Key Performance Indicators for Smart Sustainable Cities (2017)
    </Code>
    but with the following modifications
    <Table>
      <Thead>
        <Tr>
          <Th>Official KPI</Th>
          <Th>Modified KPI</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>
            <Code>SC: EH: ED:1C</Code>
          </Td>
          <Td>
            <Code>SC: EH: ED: 1C</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Code>SC: EH: ED:2C</Code>
          </Td>
          <Td>
            <Code>SC: EH: ED: 2C</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Code>SC: EH: H:1C</Code>
          </Td>
          <Td>
            <Code>SC: EH: H: 1C</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Code>SC: EH: H:3C</Code>
          </Td>
          <Td>
            <Code>SC: EH: H: 3C</Code>
          </Td>
        </Tr>
      </Tbody>
    </Table>
    <br />
    We did these modifications because we consider them to correct misentered data.
    <br />
    <br />
    Trondheim kommune have done some other modifications in their Airtable for data driven
    sustainability, where the following modifications are done:
    <Table>
      <Thead>
        <Tr>
          <Th>Airtable KPI</Th>
          <Th>Official KPI</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>
            <Code>SC: EH: H: 6A</Code>
          </Td>
          <Td>
            <Code>SC: EH: ED: 5A</Code>
          </Td>
        </Tr>
      </Tbody>
    </Table>
    <br />
    These modifications are not supported by the data upload functionality.
    <br />
  </>
);

const CSVInfoDataseries = (
  <>
    Indicators with required dataseries:
    <Table>
      <Thead>
        <Tr>
          <Th minWidth="175px">Indicator (KPI)</Th>
          <Th>Dataseries</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>EC: ICT: ICT: 4C</Td>
          <Td>
            <Code>3g</Code>
            {', '}
            <Code>4g</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EC: ICT: PS: 1A</Td>
          <Td>
            <Code>number</Code>
            {', '}
            <Code>percent</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EC: I: T: 4A</Td>
          <Td>
            <Code>cycling</Code>
            {', '}
            <Code>public</Code>
            {', '}
            <Code>private</Code>
            {', '}
            <Code>walking</Code>
            {', '}
            <Code>para</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EC: I: UP: 2A</Td>
          <Td>
            <Code>compact</Code>
            {', '}
            <Code>connected</Code>
            {', '}
            <Code>integrated</Code>
            {', '}
            <Code>inclusive</Code>
            {', '}
            <Code>resilient</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EN: EN: AQ: 1C</Td>
          <Td>
            <Code>pm_10</Code>
            {', '}
            <Code>pm_2.5</Code>
            {', '}
            <Code>no2</Code>
            {', '}
            <Code>so2</Code>
            {', '}
            <Code>o3</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EN: EN: WS: 4C</Td>
          <Td>
            <Code>primary</Code>
            {', '}
            <Code>secondary</Code>
            {', '}
            <Code>tertiary</Code>
          </Td>
        </Tr>
        <Tr>
          <Td>EN: EN: WA: 1C</Td>
          <Td>
            <Code>landfill</Code>
            {', '}
            <Code>burnt</Code>
            {', '}
            <Code>incinerated</Code>
            {', '}
            <Code>open_dump</Code>
            {', '}
            <Code>recycled</Code>
            {', '}
            <Code>other</Code>
          </Td>
        </Tr>
      </Tbody>
    </Table>
    <br />
    If the indicator does not have an associated dataseries, then leave the cell blank.
    <br />
  </>
);

const CSVInfoAllKPIs = (
  <Accordion allowToggle>
    <AccordionItem key="all-kpis">
      <AccordionButton>
        <Box flex="1" textAlign="left">
          All KPIs.
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Table>
          <Thead>
            <Tr>
              <Th key="1" w="200px">
                KPI
              </Th>
              <Th key="2">Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from(U4SSC_KPI_NAMES).map(([key, val]) => {
              if (key.indexOf('-') > -1) return null;

              return (
                <Tr key={key}>
                  <Td>
                    <Code>{key}</Code>
                  </Td>
                  <Td>{val.eng}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

// Moved to it's own component in order to avoid render lag on state update...
const CSVDataInfo: React.FC = () => (
  <Accordion allowToggle>
    <AccordionItem key="data-format">
      <AccordionButton>
        <Box flex="1" textAlign="left">
          CSV Data format requirements
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        The following fields are required for data points:
        <Table>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Field name</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>KPI Id</Td>
              <Td>
                <Code>indicator</Code>
              </Td>
              <Td>Identifying number / string of KPI</Td>
            </Tr>
            <Tr>
              <Td>Data series</Td>
              <Td>
                <Code>dataseries</Code>
              </Td>
              <Td>Name of data series (if applicable)</Td>
            </Tr>
            <Tr>
              <Td>Value</Td>
              <Td>
                <Code>data</Code>
              </Td>
              <Td>The value of the data point, as defined by the Collection Methodology</Td>
            </Tr>
          </Tbody>
        </Table>
        <br />
        {CSVInfoMods}
        <br />
        {CSVInfoDataseries}
        <br />
        Example csv:
        <br />
        <Code>
          indicator;dataseries;data
          <br />
          EN: EN: WA: 1C;landfill;20
          <br />
          EN: EN: WA: 1C;burnt;20
          <br />
          EN: EN: WA: 1C;open_dump;20
          <br />
          EC: ICT: ICT: 4C;4g;80
          <br />
          EC: ICT: ICT: 4C;3g;99
          <br />
          EN: EN: AQ: 1C;pm_10;5
          <br />
          EN: EN: AQ: 1C;pm_2.5;2.5
          <br />
          EN: EN: AQ: 1C;no2;3.4
          <br />
          EC: I: WS: 1C;;99
          <br />
          EC: ICT: ES: 1C;;75
          <br />
          SC: SH: HO: 1C;;0
          <br />
          SC: SH: SA: 1C;;1.5
          <br />
        </Code>
        <br />
        <br />
        {CSVInfoAllKPIs}
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

// Moved to it's own component in order to avoid render lag on state update...
const CSVGoalInfo: React.FC = () => (
  <Accordion allowToggle>
    <AccordionItem key="goal-format">
      <AccordionButton>
        <Box flex="1" textAlign="left">
          CSV Goal format requirements
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        The following fields are required for goals:
        <Table>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Field name</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>KPI Id</Td>
              <Td>
                <Code>indicator</Code>
              </Td>
              <Td>
                KPI Identificator, must be one of the ids listed in the list of all KPIs below.
              </Td>
            </Tr>
            <Tr>
              <Td>Data series</Td>
              <Td>
                <Code>dataseries</Code>
              </Td>
              <Td>Name of data series (if applicable)</Td>
            </Tr>
            <Tr>
              <Td>Baseline year</Td>
              <Td>
                <Code>baselineYear</Code>
              </Td>
              <Td>The year when measurements began.</Td>
            </Tr>
            <Tr>
              <Td>Baseline value</Td>
              <Td>
                <Code>baseline</Code>
              </Td>
              <Td>The value of the KPI (and data series) in the baseline year.</Td>
            </Tr>
            <Tr>
              <Td>Target value</Td>
              <Td>
                <Code>target</Code>
              </Td>
              <Td>The targeted value for the KPI (and data series).</Td>
            </Tr>
            <Tr>
              <Td>Deadline year</Td>
              <Td>
                <Code>deadline</Code>
              </Td>
              <Td>The year determined to be a deadline for the KPI and data series combination.</Td>
            </Tr>
            <Tr>
              <Td>Start Range</Td>
              <Td>
                <Code>startRange</Code>
              </Td>
              <Td>
                The value corresponding to 0% completion. MUST not equal the target value. Should be
                set according to guidance below.
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <br />
        Start range guidance:
        <UnorderedList>
          <ListItem>
            If the Collection Methodology specifies that higher and increasing values are considered
            positive, then the start range should be set to 0.
          </ListItem>
          <ListItem>
            If the Collection Methodology specifies that lower values and decreasing values are
            considered positive AND:
            <UnorderedList>
              <ListItem>
                The value is a percentage, then the start range should be set to 100
              </ListItem>
              <ListItem>
                Otherwise, the start range should be set according to good judgement to determine an
                appropriate start range. What&apos;s considered an appropriate value will probably
                differ somewhat from KPI to KPI and from municipality to municipality. The chief
                consideration is that the value set as the start range represents a completion of
                0%.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            If the Collection Methodology does not specify whats considered positive, then the
            determination must be done according to the &quot;Otherwise&quot; section above.
          </ListItem>
        </UnorderedList>
        <br />
        {CSVInfoMods}
        <br />
        {CSVInfoDataseries}
        <br />
        Example csv:
        <br />
        <Code>
          indicator;dataseries;baselineYear;baseline;target;deadline;startRange
          <br />
          EN: EN: WA: 1C;landfill;2015;15;20;2030;0
          <br />
          EN: EN: WA: 1C;burnt;2010;10;15;2040;0
          <br />
          EN: EN: WA: 1C;open_dump;2014;0;20;2025;0
          <br />
          EC: ICT: ICT: 4C;4g;80;2015;100;2030;0
          <br />
          EC: ICT: ICT: 4C;3g;95;2005;100;2015;0
          <br />
          EN: EN: AQ: 1C;pm_10;5;2015;2.1;2030;1000
          <br />
          EN: EN: AQ: 1C;pm_2.5;2.5;2015;1;2030;1000
          <br />
          EN: EN: AQ: 1C;no2;3.4;2015;1;2030;100
          <br />
          EC: I: WS: 1C;;99;2000;100;2030;0
          <br />
          EC: ICT: ES: 1C;;75;2010;100;2030;0
          <br />
          SC: SH: HO: 1C;;0;2010;0;2015;100
          <br />
          SC: SH: SA: 1C;;1.5;2015;0;2030;100
          <br />
        </Code>
        <br />
        <br />
        {CSVInfoAllKPIs}
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const GDCDataEntry: React.FC = () => {
  const history = useHistory();
  const toast = useToast();

  const [municipalities, setMunicipalities] = useState<Municipality[]>();

  const [selectedDataMunicipality, setDataMunicipality] = useState<string | undefined>();
  const [selectedGoalMunicipality, setGoalMunicipality] = useState<string | undefined>();

  const [errorDataMunicipality, setErrorDataMunicipality] = useState<boolean>(false);
  const [errorDataYear, setErrorDataYear] = useState<boolean>(false);
  const [errorDataFile, setErrorDataFile] = useState<boolean>(false);

  const [errorGoalMunicipality, setErrorGoalMunicipality] = useState<boolean>(false);
  const [errorGoalFile, setErrorGoalFile] = useState<boolean>(false);

  const [dataYear, setDataYear] = useState<number | null>(null);

  const [dataFile, setDataFile] = useState<File | null>(null);
  const [goalFile, setGoalFile] = useState<File | null>(null);

  const [dataDummy, setDataDummy] = useState<boolean>(false);
  const [goalDummy, setGoalDummy] = useState<boolean>(false);

  const loadToken = async () => {
    if (!reducer.getState().login.token) {
      const tok = localStorage.getItem('token');
      if (tok) {
        const token = JSON.parse(tok);
        const res = await validateToken(token);
        if (res) {
          reducer.dispatch(tokenVerified(JSON.parse(tok)));
          return;
        }

        reducer.dispatch(tokenUnverified());
      }

      history.push('/login');
    }
  };

  const loadMunicipalities = async () => {
    const munis = await getAllMunicipalities();
    if (munis) {
      setMunicipalities(
        munis.sort((a, b) => {
          if (a.code < b.code) return -1;
          if (a.code > b.code) return 1;
          return 0;
        }),
      );

      if (municipalities && municipalities.length > 0) {
        setDataMunicipality(municipalities[0].code);
        setGoalMunicipality(municipalities[0].code);
      }
    }
  };

  useEffect(() => {
    if (!reducer.getState().login.token) {
      loadToken();
    }

    if (municipalities === undefined) {
      loadMunicipalities();
      console.log(selectedDataMunicipality);
    }
  });

  const onSubmitData = async () => {
    setErrorDataMunicipality(!selectedDataMunicipality);
    setErrorDataYear(!dataYear || Number.isNaN(dataYear));
    setErrorDataFile(!dataFile);

    if (selectedDataMunicipality && dataYear && !Number.isNaN(dataYear) && dataFile) {
      const form = new FormData();
      form.append('csv', dataFile, dataFile.name);
      form.append('municipality', selectedDataMunicipality);
      form.append('year', JSON.stringify(dataYear));
      if (dataDummy) form.append('isDummy', JSON.stringify(true));

      toast({
        title: 'Processing',
        description: "We're processing your data file...",
        status: 'info',
        isClosable: true,
      });

      const succeeded = await uploadDataCSV(reducer.getState().login.token as string, form);
      if (succeeded) {
        toast({
          title: 'Success!',
          description: 'Data added.',
          status: 'success',
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'There were errors while processing the data.',
          status: 'error',
          isClosable: true,
        });
      }
    }
  };

  const onSubmitGoals = async () => {
    setErrorGoalMunicipality(!selectedGoalMunicipality);
    setErrorGoalFile(!goalFile);

    if (selectedGoalMunicipality && goalFile) {
      const form = new FormData();
      form.append('csv', goalFile, goalFile.name);
      form.append('municipality', selectedGoalMunicipality);
      if (goalDummy) form.append('isDummy', JSON.stringify(true));

      toast({
        title: 'Processing',
        description: "We're processing the data...",
        status: 'info',
        isClosable: true,
      });

      const succeeded = await uploadGoalCSV(reducer.getState().login.token as string, form);
      if (succeeded) {
        toast({
          title: 'Success!',
          description: 'Goals added.',
          status: 'success',
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'There were errors while processing the goals.',
          status: 'error',
          isClosable: true,
        });
      }
    }
  };

  // Render spinner when loading data
  if (!municipalities)
    return (
      <Stack spacing="10">
        <Flex
          align="center"
          justify="center"
          justifyContent="space-evenly"
          h="150px"
          spacing="10"
          bg="cyan.700"
        >
          <Stack spacing="10">
            <Heading size="lg" color="white">
              Data upload
            </Heading>
          </Stack>
        </Flex>
        <Flex align="center" justify="center" justifyContent="space-evenly" spacing="10">
          <Stack
            bg="white"
            w="800px"
            align="center"
            justify="center"
            justifyContent="center"
            p="10"
            spacing="10"
            alignItems="center"
          >
            <Spinner
              size="xl"
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="cyan.700"
            />
            <Text size="md">Loading...</Text>
          </Stack>
        </Flex>
      </Stack>
    );

  return (
    <Stack spacing="10">
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
        h="150px"
        spacing="10"
        bg="cyan.700"
      >
        <Stack spacing="10">
          <Heading size="lg" color="white">
            Data upload
          </Heading>
        </Stack>
      </Flex>
      <Flex align="center" justify="center" justifyContent="space-evenly" spacing="10">
        <Stack
          bg="white"
          w="800px"
          align="center"
          justify="center"
          justifyContent="center"
          p="10"
          spacing="10"
          alignItems="center"
        >
          <Tabs isLazy w="800px" pl="10" pr="10">
            <TabList pl="10" pr="10">
              <Tab>Data</Tab>
              <Tab>Goals</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Stack w="100%" p="10">
                  {(errorDataMunicipality || errorDataYear || errorDataFile) && (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertTitle>Missing required fields:</AlertTitle>
                      <AlertDescription>
                        {`${errorDataMunicipality ? 'Municipality' : ''}${
                          errorDataMunicipality && errorDataYear ? ', ' : ''
                        }${errorDataYear ? 'Year' : ''}${
                          errorDataYear && errorDataFile ? ', ' : ''
                        }${errorDataFile ? 'File' : ''}`}
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormControl id="data-municipality" isRequired>
                    <FormLabel>Municipality</FormLabel>
                    <Select
                      value={selectedDataMunicipality}
                      onChange={(evt) => setDataMunicipality(evt.currentTarget.value)}
                      isInvalid={errorDataMunicipality}
                      errorBorderColor="crimson"
                    >
                      {municipalities &&
                        municipalities.map((muni) => (
                          <option key={muni.code} value={muni.code}>
                            {muni.name}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl id="data-year" isRequired>
                    <FormLabel>Year:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
                      onChange={(evt) => setDataYear(parseInt(evt.currentTarget.value, 10))}
                      isInvalid={errorDataYear}
                    />
                  </FormControl>
                  <FormControl id="data-file" isRequired>
                    <FormLabel>File:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
                      type="file"
                      style={{
                        paddingTop: '0.25rem',
                        paddingLeft: '0.25rem',
                        height: '40px',
                        opacity: 0,
                        zIndex: 20,
                        cursor: 'pointer',
                      }}
                      onChange={(evt) => setDataFile(evt.target.files ? evt.target.files[0] : null)}
                      accept="text/csv, .csv"
                      isInvalid={errorDataFile}
                    />
                    <InputGroup
                      style={{
                        height: '40px',
                        marginTop: '-40px',
                      }}
                    >
                      <InputLeftElement
                        style={{
                          width: '6rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Button>Browse...</Button>
                      </InputLeftElement>
                      <Input
                        value={dataFile ? dataFile.name : ''}
                        isReadOnly
                        style={{
                          paddingLeft: '7rem',
                          cursor: 'pointer',
                        }}
                        errorBorderColor="crimson"
                        isInvalid={errorDataFile}
                      />
                    </InputGroup>
                  </FormControl>
                  <Spacer m="0.5rem" />
                  <FormControl id="data-dummy">
                    <FormLabel>Is this dummy data?</FormLabel>
                    <Checkbox
                      isChecked={dataDummy}
                      onChange={(evt) => setDataDummy(evt.currentTarget.checked)}
                    >
                      Dummy data
                    </Checkbox>
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitData}>Upload data</Button>
                  <Spacer m="2rem" />
                  <CSVDataInfo />
                </Stack>
              </TabPanel>
              <TabPanel>
                <Stack w="100%" p="10">
                  {(errorGoalMunicipality || errorGoalFile) && (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertTitle>Missing required fields:</AlertTitle>
                      <AlertDescription>
                        {`${errorGoalMunicipality ? 'Municipality' : ''}${
                          errorGoalMunicipality && errorGoalFile ? ', ' : ''
                        }${errorGoalFile ? 'File' : ''}`}
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormControl id="goal-municipality" isRequired>
                    <FormLabel>Municipality</FormLabel>
                    <Select
                      value={selectedGoalMunicipality}
                      onChange={(evt) => setGoalMunicipality(evt.currentTarget.value)}
                      isInvalid={errorGoalMunicipality}
                      errorBorderColor="crimson"
                    >
                      {municipalities &&
                        municipalities.map((muni) => (
                          <option key={muni.code} value={muni.code}>
                            {muni.name}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl id="goal-file" isRequired>
                    <FormLabel>File:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
                      type="file"
                      style={{
                        paddingTop: '0.25rem',
                        paddingLeft: '0.25rem',
                        height: '40px',
                        opacity: 0,
                        zIndex: 20,
                        cursor: 'pointer',
                      }}
                      onChange={(evt) => setGoalFile(evt.target.files ? evt.target.files[0] : null)}
                      accept="text/csv, .csv"
                    />
                    <InputGroup
                      style={{
                        height: '40px',
                        marginTop: '-40px',
                      }}
                    >
                      <InputLeftElement
                        style={{
                          width: '6rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Button>Browse...</Button>
                      </InputLeftElement>
                      <Input
                        value={goalFile ? goalFile.name : ''}
                        isReadOnly
                        style={{
                          paddingLeft: '7rem',
                          cursor: 'pointer',
                        }}
                        isInvalid={errorGoalFile}
                        errorBorderColor="crimson"
                      />
                    </InputGroup>
                  </FormControl>
                  <Spacer m="0.5rem" />
                  <FormControl id="goal-dummy">
                    <FormLabel>Are these dummy goals?</FormLabel>
                    <Checkbox
                      isChecked={goalDummy}
                      onChange={(evt) => setGoalDummy(evt.currentTarget.checked)}
                    >
                      Dummy goals
                    </Checkbox>
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitGoals}>Upload goals</Button>
                  <Spacer m="2rem" />
                  <CSVGoalInfo />
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default GDCDataEntry;
