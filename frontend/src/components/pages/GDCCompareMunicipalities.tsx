import { Stack, Select, Flex, Container, Text, Spacer } from '@chakra-ui/react';
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

  const [selectedGoals, setSelectedGoals] = useState<number>(-1);

  const [municipalityInfo, setMunicipalityInfo] = useState<MunicipalityInfo>();
  const [compareMunicipalityInfo, setCompareMunicipalityInfo] = useState<MunicipalityInfo>();

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
    setSelectedYear(parseFloat(evt.currentTarget.value));
  };

  const onChangeGoalset = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGoals(parseInt(evt.currentTarget.value, 10));
  };

  const name = municipalityInfo === undefined ? '' : municipalityInfo.name;
  const otherName = compareMunicipalityInfo === undefined ? '' : compareMunicipalityInfo.name;

  return (
    <Stack>
      <MunicipalityInfoView info={municipalityInfo} compareInfo={compareMunicipalityInfo} />
      <Flex align="center" justify="center" justifyContent="space-evenly" m="0px" p="0px">
        <Stack w={{ base: '900px', '2xl': '1420px' }} bg="white" m="0px" spacing="10">
          <Container minWidth="800px" p="1em">
            <Flex w="800px" align="center" justify="center" justifyContent="space-evenly">
              <Stack direction="row">
                <Text size="md" p="0.4em">
                  Goal override:
                </Text>
                <Select value={selectedGoals} onChange={onChangeGoalset} w="250px">
                  <option key="separate" value={-1}>
                    Separate
                  </option>
                  <option key="both-first" value={0}>
                    {`Force ${municipalityInfo !== undefined ? municipalityInfo.name : ''}`}
                  </option>
                  <option key="both-second" value={1}>
                    {`Force ${
                      compareMunicipalityInfo !== undefined ? compareMunicipalityInfo.name : ''
                    }`}
                  </option>
                  <option key="swap" value={2}>
                    Swap
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
          <GDCView
            key={selectedYear}
            year={selectedYear}
            municipality={name}
            municipalityCode={municipality}
            compareMunicipality={otherName}
            compareCode={otherMunicipality}
          />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default CompareMunicipalities;
