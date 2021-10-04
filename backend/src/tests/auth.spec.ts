import { assert } from 'chai';
import * as jwt from 'jsonwebtoken';
import { checkPassword, verifyToken } from '../auth/credentials';

import config from '../config';

const testUserHash =
  '10$JDJiJDEyJGFGc2FKRTQvTi5aUG92RjhwRnAwb08=$yMmWbQlT/4kFZp+bPlsKbqUsjjCkuW3F51+4FYqBVGRFmLIgrC+hL3XuVBXfdhxhO2InUiJxJkrnAapLYMOZ1A==';
describe('checkPassword method', () => {
  it('should return "true"', async () => {
    assert(checkPassword('123', testUserHash));
  });
});
describe('Token Verification', () => {
  const expiry: number = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const secret = config.JWT_SECRET_TOKEN!;
  const validToken = jwt.sign(
    {
      exp: expiry,
      username: 'test',
      apiAvailable: true,
    },
    secret!,
  );
  const expiredToken = jwt.sign(
    {
      exp: 0,
      username: 'test',
      apiAvailable: true,
    },
    secret,
  );
  it('Verifies valid token', () => {
    assert(verifyToken(validToken));
  });
  it('Denies expired token', () => {
    assert(!verifyToken(expiredToken));
  });
});
