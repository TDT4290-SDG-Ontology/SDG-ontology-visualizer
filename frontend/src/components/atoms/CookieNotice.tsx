import React, { useState } from 'react';
import { Center, Stack, Heading, Text, Button } from '@chakra-ui/react';

const CookieNotice = () => {
  const [isOpen, setOpen] = useState<boolean>(() => {
    const item = localStorage.getItem('cookieDismissed');
    if (item) return !JSON.parse(item);
    return true;
  });

  const onDismiss = () => {
    localStorage.setItem('cookieDismissed', JSON.stringify(true));
    setOpen(false);
  };

  if (!isOpen) return null;

  return (
    <footer>
      <Center position="fixed" zIndex="10" bottom="0" p={4} h="15vh" mt="20" w="100%">
        <Stack>
          <Heading size="md" color="white">
            This site uses cookies to provide user authenticated access to priveleged functionality.
          </Heading>
          <Text color="white">
            These cookies are &quot;Strictly necessary cookies&quot; for the functionality of this
            website, and thus fall under the GDPR exceptions.
          </Text>
        </Stack>
        <Button onClick={onDismiss} ml="20">
          Close
        </Button>
      </Center>
      <Center
        position="fixed"
        zIndex="9"
        bottom="0"
        bg="black"
        opacity="0.75"
        p={4}
        h="15vh"
        mt="20"
        w="100%"
      />
    </footer>
  );
};

export default CookieNotice;
