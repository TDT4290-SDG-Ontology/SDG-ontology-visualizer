import { expect, assert } from 'chai';
import { encodePasswordHash, decodePasswordHash, checkPassword, verifyToken } from '../auth/credentials'

const testUserHash = '10$JDJiJDEyJGFGc2FKRTQvTi5aUG92RjhwRnAwb08=$yMmWbQlT/4kFZp+bPlsKbqUsjjCkuW3F51+4FYqBVGRFmLIgrC+hL3XuVBXfdhxhO2InUiJxJkrnAapLYMOZ1A=='

describe('Check test password', () => {
    it('should return "true"', async () => {
        assert(checkPassword('123', testUserHash))
    });
  });