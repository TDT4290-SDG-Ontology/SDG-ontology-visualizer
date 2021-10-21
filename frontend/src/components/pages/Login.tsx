import React, { useState } from 'react';
import {
  Heading,
  Stack,
  Text,
  Flex,
  Input,
  Button,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

import reducer from '../../state/store';
import { loginSuccess } from '../../state/reducers/loginReducer';

import { login, validateToken } from '../../api/auth';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  /*
  const [didError, setDidError] = useState<boolean>(false);
  */
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onSubmit = async () => {
    const data = await login(username, password);
    if (data) {
      console.log(data);
      reducer.dispatch(loginSuccess(data));
    }
  };

  return (
    <Stack spacing="10">
      <Flex
        align="center"
        justify="center"
        justifyContent="space-evenly"
        h="150px"
        spacing="10"
        bg="cyan.700"
      >
        <Stack spacing="10">
          <Heading size="lg" color="white">
            Please log in
          </Heading>
        </Stack>
      </Flex>
      <Flex align="center" justify="center" justifyContent="space-evenly" spacing="10">
        <Stack
          bg="white"
          w="800px"
          align="center"
          justify="center"
          justifyContent="center"
          p="10"
          spacing="10"
          alignItems="center"
        >
          <Heading size="md" mt="5">
            The functionality you want to access requires valid credentials.
          </Heading>
          <Stack w="100%" p="10">
            <Text>Username:</Text>
            <Input onChange={(evt) => setUsername(evt.currentTarget.value)} />
            <Text>Password:</Text>
            <InputGroup size="md">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                onChange={(evt) => setPassword(evt.currentTarget.value)}
              />
              <InputRightElement w="4rem">
                <Button onClick={() => setShowPassword(!showPassword)} size="sm" mr="1">
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button onClick={onSubmit}>Log in</Button>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default Login;
