import { SimpleGrid, Heading, Stack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllMunicipalities } from '../../api/municipalities';
import { Municipality } from '../../types/municipalityTypes';

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

  return (
    <Stack align="center" spacing="20">
      <SimpleGrid columns={3} spacing={20}>
        {municipalities &&
          municipalities.map((mun) => {
            const countryCode = mun.code.slice(0, mun.code.indexOf('.'));
            return (
              <Link key={mun.code} to={loc => ({ ...loc, pathname: `/gdc/view/${mun.code}` })}>
                <Heading size="lg">
                  {`${mun.name} (${countryCode})`}
                </Heading>
                <div>
                  {`Population: ${mun.population}`}
                </div>
              </Link>
              );
          },
        )}
      </SimpleGrid>
    </Stack>
  );
};

export default MunicipalityList;
