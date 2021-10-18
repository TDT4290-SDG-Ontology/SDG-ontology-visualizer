import { SimpleGrid, Heading, Stack, Flex, Spinner, Text, Button, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getAllMunicipalities } from '../../api/municipalities';
import { Municipality } from '../../types/municipalityTypes';

const MunicipalityList: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<Array<Municipality>>();
  const history = useHistory();

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
          municipalities.map((mun) => {
            const countryCode = mun.code.slice(0, mun.code.indexOf('.'));
            return (
              <Button
                key={mun.code}
                onClick={() => history.push(`/gdc/view/${mun.code}`)}
                borderRadius="10px"
                size="xl"
                color="white"
                bg="cyan.700"
                _hover={{ backgroundColor: 'cyan.600' }}
                p="1em"
              >
                <Box size="lg">
                  <Heading size="lg">{`${mun.name} (${countryCode})`}</Heading>
                  <div>{`Population: ${mun.population}`}</div>
                </Box>
              </Button>
            );
          })}
      </SimpleGrid>
    </Stack>
  );
};

export default MunicipalityList;
