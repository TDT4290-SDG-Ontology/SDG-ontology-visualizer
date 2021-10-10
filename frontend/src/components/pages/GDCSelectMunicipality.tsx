import { Heading, Stack, Flex } from '@chakra-ui/react';
import React from 'react';

import MunicipalityList from '../molecules/MunicipalityList';

const SelectMunicipality: React.FC = () => (
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
          Select municipality
        </Heading>
      </Stack>
    </Flex>
    <MunicipalityList />
  </Stack>
);

export default SelectMunicipality;
