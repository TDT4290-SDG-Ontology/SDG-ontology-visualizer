import { Stack } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router-dom';

import MunicipalityInfo from '../molecules/MunicipalityInfo';
// import GDCView from '../molecules/GDCView';

type GDCViewParams = {
  municipality: string;
};

const ViewMunicipality: React.FC = () => {
  const { municipality } = useParams<GDCViewParams>();

  return (
    <Stack spacing="10">
      <MunicipalityInfo code={municipality} />
    </Stack>
  );
};

export default ViewMunicipality;
