import { Flex, Heading, Stack, Text, SimpleGrid, Container } from '@chakra-ui/react';
import React from 'react';

import { MunicipalityInfo } from '../../types/municipalityTypes';

type MunicipalityInfoDisplayProps = {
  info: MunicipalityInfo | undefined;
  compareInfo?: MunicipalityInfo;
};

const defaultProps = {
  compareInfo: undefined,
};

const MunicipalityInfoDisplay: React.FC<MunicipalityInfoDisplayProps> = (
  props: MunicipalityInfoDisplayProps,
) => {
  const { info, compareInfo } = props;

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

  if (compareInfo !== undefined) {
    return (
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
        h="150px"
        spacing="10"
        bg="cyan.700"
      >
        <SimpleGrid columns={3} spacing={150}>
          <Stack spacing="0" align="center">
            <Heading size="xl" color="white">
              {info.name}
            </Heading>
            <Text size="md" color="white">
              {`Population: ${info.population}`}
            </Text>
          </Stack>
          <Container align="center" justify="center" justifyContent="space-evenly">
            <Heading color="white">vs</Heading>
          </Container>
          <Stack spacing="0" align="center">
            <Heading size="xl" color="white">
              {compareInfo.name}
            </Heading>
            <Text size="md" color="white">
              {`Population: ${compareInfo.population}`}
            </Text>
          </Stack>
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
      h="150px"
      spacing="10"
      bg="cyan.700"
    >
      <Stack spacing="0" align="center">
        <Heading size="xl" color="white">
          {info.name}
        </Heading>
        <Text size="md" color="white">
          {`Population: ${info.population}`}
        </Text>
      </Stack>
    </Flex>
  );
};

MunicipalityInfoDisplay.defaultProps = defaultProps;
export default MunicipalityInfoDisplay;
