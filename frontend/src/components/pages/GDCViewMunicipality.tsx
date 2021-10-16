import { Stack, Select, Flex, Container, Text, Spacer, Button, Modal, ModalOverlay, ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Link,
  Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { MunicipalityInfo, Municipality } from '../../types/municipalityTypes';
import { getAvailableYears } from '../../api/data';
import { getMunicipalityInfo, getAllMunicipalities, getSimilarMunicipalities } from '../../api/municipalities';

import MunicipalityInfoView from '../molecules/MunicipalityInfo';
import GDCView from '../molecules/GDCView';

type GDCViewParams = {
  municipality: string;
};

const ViewMunicipality: React.FC = () => {
  const { municipality } = useParams<GDCViewParams>();
  const [availableYears, setAvailableYears] = useState<Array<number>>();
  const [selectedYear, setSelectedYear] = useState<number>(-1);

  const [municipalityInfo, setMunicipalityInfo] = useState<MunicipalityInfo>();

  const [allMunicipalities, setAllMunicipalities] = useState<Municipality[]>();
  const [similarMunicipalities, setSimilarMunicipalities] = useState<Municipality[]>();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadData = async (muniCode: string) => {
    const data = await Promise.all([getAvailableYears(muniCode), getMunicipalityInfo(muniCode)]);

    const years: number[] = data[0];
    const muniInfo: MunicipalityInfo = data[1];

    setAvailableYears(years.sort());
    setSelectedYear(years[years.length - 1]);
    setMunicipalityInfo(muniInfo);

    const municipalities = await Promise.all([getAllMunicipalities(), getSimilarMunicipalities(muniCode)]);
    setAllMunicipalities(municipalities[0]);
    setSimilarMunicipalities(municipalities[1]);
  };

  useEffect(() => {
    loadData(municipality);
  }, []);

  const onChangeYear = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseFloat(evt.currentTarget.value));
  };

  const name = municipalityInfo === undefined ? '' : municipalityInfo.name;

  return (
    <Stack>
      <MunicipalityInfoView info={municipalityInfo} />
      <Flex align="center" justify="center" justifyContent="space-evenly" m="0px" p="0px">
        <Stack w={{ base: '900px', '2xl': '1420px' }} bg="white" m="0px" spacing="10">
          <Container align="right" justify="right" justifyContent="space-evenly" p="1em">
            <Flex>
              <Button onClick={onOpen}>Compare with ...</Button>
              <Spacer />
              <Stack direction="row">
                <Text size="md" p="0.4em">Year:</Text>
                <Select value={selectedYear} onChange={onChangeYear} w="100px">
                  {availableYears &&
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </Select>
              </Stack>
            </Flex>
          </Container>
          <GDCView
            key={selectedYear}
            year={selectedYear}
            municipality={name}
            municipalityCode={municipality}
          />
        </Stack>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay  />
        <ModalContent>
          <ModalHeader>Select municipality to compare with</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Similar</Tab>
                <Tab>All</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SimpleGrid columns={3} spacing={20}>
                    { similarMunicipalities && similarMunicipalities.map((mun) => {
                        const countryCode = mun.code.slice(0, mun.code.indexOf('.'));
                        return (
                          <Link key={mun.code} to={(loc: any) => ({ ...loc, pathname: `/gdc/compare/${municipality}/${mun.code}` })}>
                            <Heading size="lg">{`${mun.name} (${countryCode})`}</Heading>
                            <div>{`Population: ${mun.population}`}</div>
                          </Link>
                        );
                      })}
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid columns={3} spacing={20}>
                    { allMunicipalities && allMunicipalities.map((mun) => {
                        const countryCode = mun.code.slice(0, mun.code.indexOf('.'));
                        return (
                          <Link key={mun.code} to={(loc: any) => ({ ...loc, pathname: `/gdc/compare/${municipality}/${mun.code}` })}>
                            <Heading size="lg">{`${mun.name} (${countryCode})`}</Heading>
                            <div>{`Population: ${mun.population}`}</div>
                          </Link>
                        );
                      })}
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default ViewMunicipality;
