import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getMunicipalityInfo } from '../../api/municipalities';
import { MunicipalityInfo } from '../../types/municipalityTypes';
import GDCMinicipalityChart from '../atoms/GDCMinicipalityChart';

type MunicipalityInfoDisplayProps = {
  code: string;
  year: number;
};

const MunicipalityInfoDisplay: React.FC<MunicipalityInfoDisplayProps> = (props: MunicipalityInfoDisplayProps) => {
  const [municipalityInfo, setMunicipalityInfo] = useState<MunicipalityInfo>();

  const { code, year } = props;

  const loadMunicipality = async (muniCode: string) => {
    const data = await getMunicipalityInfo(muniCode);
    setMunicipalityInfo(data);
  };

  useEffect(() => {
    loadMunicipality(code);
  }, []);

  if (municipalityInfo === undefined)
    return (
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
        h="150px"
        spacing="10"
        bg="cyan.700"
      >
        <Stack spacing="10">
          <Heading size="xl" color="white">
            Unknown municipality
          </Heading>
        </Stack>
      </Flex>
    );

  return (
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
      h="400px"
      spacing="10"
      bg="cyan.700"
    >
      <Stack spacing="0">
        <Heading size="xl" color="white">
          { `${municipalityInfo.name}` }
        </Heading>
        <Text size="md" color="white">
          {`Population: ${municipalityInfo.population}`}
        </Text>
      </Stack>
      <GDCMinicipalityChart year={year} code={code} />
    </Flex>
  );
};

export default MunicipalityInfoDisplay;
