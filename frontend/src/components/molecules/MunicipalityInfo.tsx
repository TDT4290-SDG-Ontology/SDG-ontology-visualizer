import { Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { MunicipalityInfo } from '../../types/municipalityTypes';

type MunicipalityInfoDisplayProps = {
  info: MunicipalityInfo | undefined;
};

const MunicipalityInfoDisplay: React.FC<MunicipalityInfoDisplayProps> = (
  props: MunicipalityInfoDisplayProps,
) => {
  const { info } = props;

  if (info === undefined)
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
      h="150px"
      spacing="10"
      bg="cyan.700"
    >
      <Stack spacing="0">
        <Heading size="xl" color="white">
          {`${info.name}`}
        </Heading>
        <Text size="md" color="white">
          {`Population: ${info.population}`}
        </Text>
      </Stack>
    </Flex>
  );
};

export default MunicipalityInfoDisplay;
