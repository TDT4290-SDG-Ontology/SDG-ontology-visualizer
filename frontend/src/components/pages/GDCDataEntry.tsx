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
} from '@chakra-ui/react';

import { useHistory } from 'react-router-dom';

import reducer from '../../state/store';
import { tokenVerified, tokenUnverified } from '../../state/reducers/loginReducer';

import { Municipality } from '../../types/municipalityTypes';

import { validateToken } from '../../api/auth';
import { getAllMunicipalities } from '../../api/municipalities';
import { uploadDataCSV } from '../../api/data';

const GDCDataEntry: React.FC = () => {
  const history = useHistory();

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
      setMunicipalities(munis.sort((a, b) => {
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
    loadToken();
    loadMunicipalities();
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
      await uploadDataCSV(reducer.getState().login.token as string, form);
    }
  };

  const onSubmitGoals = async () => {
    setErrorGoalMunicipality(!selectedGoalMunicipality);
    setErrorGoalFile(!goalFile);
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
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="cyan.700" />
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
                    >
                      {municipalities && municipalities.map((muni) => (
                        <option key={muni.code} value={muni.code}>{muni.name}</option>
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
                      style={
                        { 
                          paddingTop: '0.25rem', 
                          paddingLeft: '0.25rem',
                          height: '40px',
                          opacity: 0,
                          zIndex: 20,
                          cursor: 'pointer',
                        }
                      }
                      onChange={(evt) => setDataFile(evt.target.files ? evt.target.files[0] : null)}
                      accept="text/csv, .csv"
                      isInvalid={errorDataFile}
                    />
                    <InputGroup
                      style={
                        {
                          height: '40px',
                          marginTop: '-40px',
                        }
                      }
                    >
                      <InputLeftElement
                        style={
                          {
                            width: '6rem',
                            cursor: 'pointer',
                          }
                        }
                      >
                        <Button>Browse...</Button>
                      </InputLeftElement>
                      <Input 
                        value={dataFile ? dataFile.name : ''} 
                        isReadOnly 
                        style={
                          {
                            paddingLeft: '7rem',
                            cursor: 'pointer',
                          }
                        }                        
                        isInvalid={errorDataFile}
                      />
                    </InputGroup>
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitData}>Upload data</Button>
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
                    <Select value={selectedGoalMunicipality} onChange={(evt) => setGoalMunicipality(evt.currentTarget.value)}>
                      {municipalities && municipalities.map((muni) => (
                        <option key={muni.code} value={muni.code}>{muni.name}</option>
                        ))}
                    </Select>
                  </FormControl>        
                  <FormControl id="goal-file" isRequired>
                    <FormLabel>File:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
                      type="file"
                      style={
                        { 
                          paddingTop: '0.25rem', 
                          paddingLeft: '0.25rem',
                          height: '40px',
                          opacity: 0,
                          zIndex: 20,
                          cursor: 'pointer',
                        }
                      }
                      onChange={(evt) => setGoalFile(evt.target.files ? evt.target.files[0] : null)}                      
                      accept="text/csv, .csv"
                    />
                    <InputGroup
                      style={
                        {
                          height: '40px',
                          marginTop: '-40px',
                        }
                      }
                    >
                      <InputLeftElement
                        style={
                          {
                            width: '6rem',
                            cursor: 'pointer',
                          }
                        }
                      >
                        <Button>Browse...</Button>
                      </InputLeftElement>
                      <Input 
                        value={goalFile ? goalFile.name : ''} 
                        isReadOnly 
                        style={
                          {
                            paddingLeft: '7rem',
                            cursor: 'pointer',
                          }
                        }
                      />
                    </InputGroup>
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitGoals}>Upload goals</Button>        
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
