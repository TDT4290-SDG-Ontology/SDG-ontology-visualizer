import React, { useState, useEffect } from 'react';
import {
  Heading,
  Stack,
  Flex,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spacer,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  TabPanel,
  TabPanels,
  TabList,
  Select,
} from '@chakra-ui/react';

import { useHistory } from 'react-router-dom';

import reducer from '../../state/store';
import { tokenVerified, tokenUnverified } from '../../state/reducers/loginReducer';

import { Municipality } from '../../types/municipalityTypes';

import { validateToken } from '../../api/auth';

import { getAllMunicipalities } from '../../api/municipalities';

const GDCDataEntry: React.FC = () => {
  const history = useHistory();

  const [municipalities, setMunicipalities] = useState<Municipality[]>();
  const [dataFile, setDataFile] = useState<File | null>(null);

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
    setMunicipalities(munis.sort((a, b) => {
        if (a.code < b.code) return -1;
        if (a.code > b.code) return 1;
        return 0;
      }),
    );
  };

  useEffect(() => {
    loadToken();
    loadMunicipalities();
  });

  const onSubmitData = async () => {
    console.log(dataFile);
  };

  const onSubmitGoals = async () => {

  };

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
          <Heading size="md" mt="5">
            ?!?!?!?
          </Heading>
          <Tabs isLazy w="800px" pl="10" pr="10">
            <TabList pl="10" pr="10">
              <Tab>Data</Tab>
              <Tab>Goals</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Stack w="100%" p="10">
                  <FormControl id="data-municipality" isRequired>
                    <FormLabel>Municipality</FormLabel>
                    <Select>
                      {municipalities && municipalities.map((muni) => (
                        <option key={muni.code} value={muni.code}>{muni.name}</option>
                        ))}
                    </Select>
                  </FormControl>                  
                  <FormControl id="data-year" isRequired>
                    <FormLabel>Year:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
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
                        }
                      }
                      onChange={(evt) => setDataFile(evt.target.files ? evt.target.files[0] : null)}
                    />
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitData}>Upload</Button>
                </Stack>
              </TabPanel>
              <TabPanel>
                <Stack w="100%" p="10">
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Missing required fields:</AlertTitle>
                    <AlertDescription>LOL!</AlertDescription>
                  </Alert>
                  <FormControl id="username" isRequired>
                    <FormLabel>Username:</FormLabel>
                    <Input
                      errorBorderColor="crimson"
                    />
                  </FormControl>
                  <FormControl id="password" isRequired>
                    <FormLabel>Password:</FormLabel>
                    <Input
                      placeholder="Enter password"
                      errorBorderColor="crimson"
                    />
                  </FormControl>
                  <Spacer m="2rem" />
                  <Button onClick={onSubmitGoals}>Log in</Button>        
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
