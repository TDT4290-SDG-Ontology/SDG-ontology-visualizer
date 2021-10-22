import { SimpleGrid, Stack, Flex, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getAllMunicipalities } from '../../api/municipalities';
import { Municipality } from '../../types/municipalityTypes';
import MunicipalityButton from '../atoms/MunicipalityButton';

const MunicipalityList: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<Array<Municipality>>();

  const loadMunicipalities = async () => {
    const data = await getAllMunicipalities();
    setMunicipalities(
      data.sort((a, b) => {
        if (a.code < b.code) return -1;
        if (a.code > b.code) return 1;
        return 0;
      }),
    );
  };

  useEffect(() => {
    loadMunicipalities();
  }, []);

  if (!municipalities) {
    return (
      <Flex align="center" justify="center" justifyContent="space-evenly">
        <Stack>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="cyan.700" />
          <Text size="md">Loading...</Text>
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack align="center">
      <SimpleGrid columns={3} spacing="10">
        {municipalities &&
          municipalities.map((mun) => (
            <MunicipalityButton key={mun.code} municipality={mun} url={`/gdc/view/${mun.code}`} />
          ))}
      </SimpleGrid>
    </Stack>
  );
};

export default MunicipalityList;
