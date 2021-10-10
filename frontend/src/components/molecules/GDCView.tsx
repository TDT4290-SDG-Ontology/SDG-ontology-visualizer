import { Flex, Heading, Stack, Text, Spinner } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { getGDCOutput } from '../../api/gdc';
import { GDCOutput } from '../../types/gdcTypes';

type GDCViewProps = {
  code: string;
  year: number | undefined;
};

const GDCView: React.FC<GDCViewProps> = (props: GDCViewProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();

  const { code, year } = props;

  const loadGDCOutput = async (muniCode: string) => {
      const data = await getGDCOutput(muniCode, (year === undefined) ? 2020 : year);
      setGDCInfo(data);
  };

  useEffect(() => {
    loadGDCOutput(code);
  }, []);

  if (gdcInfo === undefined || year === undefined)
    return (
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
      >
        <Stack>
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="cyan.700"
          />
          <Text size="md">
            Loading...
          </Text>
        </Stack>
      </Flex>
    );

  return (
    <Flex
      align="center"
      justify="center"
      justifyContent="space-evenly"
    >
      <Stack spacing="0">
        <Heading size="xl">
          Progress overview
        </Heading>
        <Text size="md">
          LOL
        </Text>
      </Stack>
    </Flex>
  );
};

export default GDCView;
