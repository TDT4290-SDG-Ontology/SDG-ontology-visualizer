import { Stack, Select, Flex, Container, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getAvailableYears } from '../../api/data';

import MunicipalityInfo from '../molecules/MunicipalityInfo';
import GDCView from '../molecules/GDCView';

type GDCViewParams = {
  municipality: string;
};

const ViewMunicipality: React.FC = () => {
  const { municipality } = useParams<GDCViewParams>();
  const [availableYears, setAvailableYears] = useState<Array<number>>();
  const [selectedYear, setSelectedYear] = useState<number>(-1);

  const loadAvailableYears = async (muniCode: string) => {
    const data = await getAvailableYears(muniCode);
    setAvailableYears(data.sort());
    setSelectedYear(data[data.length - 1]);
  };

  useEffect(() => {
    loadAvailableYears(municipality);
  }, []);

  const onChangeYear = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseFloat(evt.currentTarget.value));
  };

  return (
    <Stack>
      <MunicipalityInfo code={municipality} />
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"        
        m='0px'
        p='0px'
      >
        <Stack 
          w={{ base: '850px', '2xl': '1350px' }}
          bg='white'
          m='0px'
          spacing='10'
        >
          <Container>
            <Text size='md'>Year:</Text>
            <Select value={selectedYear} onChange={onChangeYear}>
              { 
                availableYears && availableYears.map((year) => (<option key={year} value={year}>{year}</option>))
              }
            </Select>
          </Container>
          <GDCView key={selectedYear} code={municipality} year={selectedYear} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default ViewMunicipality;
