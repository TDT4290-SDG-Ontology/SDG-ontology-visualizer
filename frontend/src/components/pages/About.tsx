import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { GoMarkGithub } from 'react-icons/go';

const About = () => (
  <Box py="10%" px="20%">
    <Stack
      spacing="10"
      align="center"
      bg="green.600"
      color="white"
      p="10"
      borderRadius="lg"
      boxShadow="xl"
    >
      <Heading as="h2" size="lg">
        Om prosjektet
      </Heading>
      <Text fontSize="md" align="left">
        Dette er en videreutvikling av en prototype laget for Trondheim kommune. Arbeidet er gjort i
        forbindelse med faget TDT4290 Kundestyrt prosjekt. Videreutviklingen realiserer
        funksjonalitet som søker å umiddelbart forbedre verktøyene tilgjengelig for datadrevet
        bærekraft ved å forbedre visualisering av historisk ytelse samt antatt fremtidig ytelse.
        <br />
        <br />
        Videreutviklingen har funnet sted på toppen av en eksisterende prototype utviklet som del av
        en batcheloroppgave i informatikk.
      </Text>
      <Link
        href="https://github.com/TDT4290-SDG-Ontology/SDG-ontology-visualizer/"
        isExternal
        color="white"
        _hover={{ opacity: '75%' }}
      >
        <GoMarkGithub size="40" />
      </Link>
    </Stack>
  </Box>
);

export default About;
