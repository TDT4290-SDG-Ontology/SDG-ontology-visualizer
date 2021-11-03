import {
  Stack,
  Select,
  Flex,
  Container,
  Text,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Center,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MunicipalityInfo } from '../../types/municipalityTypes';
import { getAvailableYears } from '../../api/data';
import { getMunicipalityInfo } from '../../api/municipalities';

import MunicipalityInfoView from '../molecules/MunicipalityInfo';
import GDCView from '../molecules/GDCView';

type GDCCompareParams = {
  municipality: string;
  otherMunicipality: string;
};

const CompareMunicipalities: React.FC = () => {
  const { municipality, otherMunicipality } = useParams<GDCCompareParams>();
  const [availableYears, setAvailableYears] = useState<Array<number>>();
  const [selectedYear, setSelectedYear] = useState<number>(-1);

  const [selectedGoals, setSelectedGoals] = useState<number>(0);

  const [municipalityInfo, setMunicipalityInfo] = useState<MunicipalityInfo>();
  const [compareMunicipalityInfo, setCompareMunicipalityInfo] = useState<MunicipalityInfo>();

  const [goalOverride, setGoalOverride] = useState<string>(municipality);
  const [overrideMode, setOverrideMode] = useState<string>('absolute');

  const [otherGoalOverride, setOtherGoalOverride] = useState<string>(otherMunicipality);

  const [showDataAlert, setShowDataAlert] = useState<boolean>(true);

  const overrideCombos = [
    [municipality, otherMunicipality],
    [municipality, municipality],
    [otherMunicipality, otherMunicipality],
    [otherMunicipality, municipality],
  ];

  const loadData = async (muniCode: string, otherCode: string) => {
    const data = await Promise.all([
      getAvailableYears(muniCode),
      getMunicipalityInfo(muniCode),
      getMunicipalityInfo(otherCode),
    ]);

    const years: number[] = data[0];
    const muniInfo: MunicipalityInfo = data[1];
    const compareMuniInfo: MunicipalityInfo = data[2];

    setAvailableYears(years.sort());
    setSelectedYear(years[years.length - 1]);

    setMunicipalityInfo(muniInfo);
    setCompareMunicipalityInfo(compareMuniInfo);
  };

  useEffect(() => {
    loadData(municipality, otherMunicipality);
  }, []);

  const onChangeYear = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(evt.currentTarget.value, 10));
  };

  const onChangeGoalset = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const selector: number = parseInt(evt.currentTarget.value, 10);
    setSelectedGoals(selector);
    setGoalOverride(overrideCombos[selector][0]);
    setOtherGoalOverride(overrideCombos[selector][1]);
  };

  const name = municipalityInfo === undefined ? '' : municipalityInfo.name;
  const otherName = compareMunicipalityInfo === undefined ? '' : compareMunicipalityInfo.name;

  let dataAlert = null;
  if (showDataAlert) {
    dataAlert = (
      <Flex align="center" justify="center" justifyContent="space-evenly" m="0px" p="0px">
        <Center w="550px">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>NOTICE!</AlertTitle>
            <AlertDescription>All data is fictional.</AlertDescription>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setShowDataAlert(false)}
            />
          </Alert>
        </Center>
      </Flex>
    );
  }

  return (
    <Stack height="100%">
      <MunicipalityInfoView info={municipalityInfo} compareInfo={compareMunicipalityInfo} />
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
        m="0px"
        p="0px"
        height="100%"
      >
        <Stack w={{ base: '900px', '2xl': '1450px' }} bg="white" m="0px" spacing="10">
          <Container minWidth="800px" p="1em">
            <Flex w="800px" align="center" justify="center" justifyContent="space-evenly">
              <Stack direction="row">
                <Text size="md" p="0.4em">
                  Goal override:
                </Text>
                <Select value={selectedGoals} onChange={onChangeGoalset} w="250px">
                  <option key="separate" value={0}>
                    Separate
                  </option>
                  <option key="both-first" value={1}>
                    {`Force ${municipalityInfo !== undefined ? municipalityInfo.name : ''}`}
                  </option>
                  <option key="both-second" value={2}>
                    {`Force ${
                      compareMunicipalityInfo !== undefined ? compareMunicipalityInfo.name : ''
                    }`}
                  </option>
                  <option key="swap" value={3}>
                    Swap
                  </option>
                </Select>
              </Stack>
              <Spacer />
              <Stack direction="row">
                <Text size="md" p="0.4em">
                  Override mode:
                </Text>
                <Select
                  value={overrideMode}
                  onChange={(evt) => setOverrideMode(evt.currentTarget.value)}
                  w="125px"
                >
                  <option key="absolute" value="absolute">
                    Absolute
                  </option>
                  <option key="relative" value="relative">
                    Relative
                  </option>
                </Select>
              </Stack>
              <Spacer />
              <Stack direction="row">
                <Text size="md" p="0.4em">
                  Year:
                </Text>
                <Select value={selectedYear} onChange={onChangeYear} w="100px">
                  {availableYears &&
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </Select>
              </Stack>
            </Flex>
          </Container>
          {dataAlert}
          <GDCView
            key={`${selectedYear}-${selectedGoals}-${overrideMode}`}
            year={selectedYear}
            municipality={name}
            municipalityCode={municipality}
            municipalityGoalOverride={goalOverride}
            compareMunicipality={otherName}
            compareCode={otherMunicipality}
            compareGoalOverride={otherGoalOverride}
            overrideMode={overrideMode}
          />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default CompareMunicipalities;
