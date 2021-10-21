import { Button, Box, Heading } from '@chakra-ui/react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Municipality } from '../../types/municipalityTypes';

type MunicipalityButtonProps = {
  municipality: Municipality;
  url: string;
};

const MunicipalityButton: React.FC<MunicipalityButtonProps> = ({
  municipality,
  url,
}: MunicipalityButtonProps) => {
  const history = useHistory();
  const countryCode = municipality.code.slice(0, municipality.code.indexOf('.'));

  return (
    <Button
      key={municipality.code}
      onClick={() => history.push(url)}
      borderRadius="10px"
      size="xl"
      color="white"
      bg="cyan.700"
      _hover={{ backgroundColor: 'cyan.600' }}
      p="1em"
    >
      <Box size="lg">
        <Heading size="lg">{`${municipality.name} (${countryCode})`}</Heading>
        <div>{`Population: ${municipality.population}`}</div>
      </Box>
    </Button>
  );
};

export default MunicipalityButton;
