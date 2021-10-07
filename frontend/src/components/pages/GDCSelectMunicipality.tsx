import { Heading, Stack, Flex } from '@chakra-ui/react';
import React from 'react';

const SelectMunicipality = () => (
  <Stack spacing="10">
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
      h="350px"
      spacing="10"
      bg="cyan.700"
    >
      <Stack spacing="10">
        <Heading size="lg" color="white">
          Select municipality
        </Heading>
      </Stack>
    </Flex>
    <Heading size="lg" align="center" color="cyan.700">
      Bærekraftsmålene:
    </Heading>
  </Stack>
);

export default SelectMunicipality;
