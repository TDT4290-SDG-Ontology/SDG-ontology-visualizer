import React, { useState } from 'react';
import {
  Heading,
  Stack,
  Flex,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spacer,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

import { useHistory } from 'react-router-dom';

import reducer from '../../state/store';
import { loginSuccess, loginFailed } from '../../state/reducers/loginReducer';

import { login } from '../../api/auth';

const Login: React.FC = () => {
  const history = useHistory();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [missingUsername, setMissingUsername] = useState<boolean>(false);
  const [missingPassword, setMissingPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<boolean>(false);

  const onSubmit = async () => {
    const error: boolean = username === '' || password === '';
    setMissingUsername(username === '');
    setMissingPassword(password === '');

    if (error) return;

    const data = await login(username, password);
    if (data) {
      setLoginError(false);
      reducer.dispatch(loginSuccess(data));
      history.goBack();
    } else {
      setLoginError(true);
      reducer.dispatch(loginFailed());
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
            {(missingUsername || missingPassword) && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Missing required fields:</AlertTitle>
                <AlertDescription>
                  {`${missingUsername ? 'Username' : ''}${
                    missingUsername && missingPassword ? ', ' : ''
                  }${missingPassword ? 'Password' : ''}`}
                </AlertDescription>
              </Alert>
            )}
            {loginError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>Invalid username or password</AlertDescription>
              </Alert>
            )}
            <FormControl id="username" isRequired>
              <FormLabel>Username:</FormLabel>
              <Input
                onChange={(evt) => setUsername(evt.currentTarget.value)}
                errorBorderColor="crimson"
                isInvalid={missingUsername}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password:</FormLabel>
              <InputGroup size="md">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  onChange={(evt) => setPassword(evt.currentTarget.value)}
                  errorBorderColor="crimson"
                  isInvalid={missingPassword}
                />
                <InputRightElement w="4rem">
                  <Button onClick={() => setShowPassword(!showPassword)} size="sm" mr="1" w="4rem">
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Spacer m="2rem" />
            <Button onClick={onSubmit}>Log in</Button>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default Login;
