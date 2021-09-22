/* eslint-disable @typescript-eslint/no-unused-vars, no-plusplus -- no-unused-vars disabled in order to help further development by having the inverse of 'decodeHash' available, no-plusplus disabled due to loops */

import { Buffer } from 'buffer';
import { pbkdf } from 'bcrypt-pbkdf';
import * as jwt from 'jsonwebtoken';
import config from '../config';

/* Composes a hashed password, salt, and number of rounds into one string suitable
 * for storage in databases.
 */
const encodePasswordHash = (passwordHash: Uint8Array, salt: Uint8Array, rounds: number) => {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const hashString = Buffer.from(passwordHash).toString('base64');
  const saltString = Buffer.from(salt).toString('base64');

  return `${rounds}$${saltString}$${hashString}`;
};

/* Decomposes a stored hash-string into its component rounds, salt, and hash.
 */
const decodePasswordHash = (encodedHash: string) => {
  // Hash format: {rounds}${salt}${hash}
  // both salt and hash are base64 encoded, so there's no crash with the separators!

  const parts: string[] = encodedHash.split('$');

  const rounds: number = parseInt(parts[0], 10);
  const salt: Uint8Array = Buffer.from(parts[1], 'base64');
  const hashedBytes: Uint8Array = Buffer.from(parts[2], 'base64');

  return { rounds, salt, hash: hashedBytes };
};

/* Checks if a password matches a provided hash, returning true if it did.
 * 'password' *must* be a utf-8 encoded string, whilst 'existingHash' *must* be an ascii encoded string.
 */
export const checkPassword = (password: string, existingHash: string) => {
  // This is *meant* to be slow. In fact, the slowness is built into the algorithm.
  // The reason this is slow is because it is used in order to reduce the efficacy of
  // brute force attacks. The slowness is controlled by the 'rounds' parameter.

  const decodedHash = decodePasswordHash(existingHash);

  const newHash: Uint8Array = new Uint8Array(decodedHash.hash.length);
  const passwordBytes: Uint8Array = new Uint8Array(Buffer.from(password, 'utf-8'));

  pbkdf(
    passwordBytes,
    passwordBytes.length,
    decodedHash.salt,
    decodedHash.salt.length,
    newHash,
    newHash.length,
    decodedHash.rounds,
  );

  // This comparison is done somewhat obtusely in order to thwart timing attacks
  // against the password comparison which earlying-out would allow. With a vulnerable
  // comparison, an attacker could, by timing the differences in response time, derive
  // passwords one character at a time.
  //
  // As it stands, the only length dependent operation in this comparison is
  // generating the hash for the password being tested.

  const existingHashedBytes = decodedHash.hash;
  let diff = newHash.length ^ existingHashedBytes.length; // eslint-disable-line no-bitwise
  for (let i = 0; i < existingHashedBytes.length; i++) {
    // eslint-disable-line no-plusplus
    // eslint-disable-line no-plusplus
    // eslint-disable-line no-plusplus
    // The bitwise XOR finds the bitwise difference between the
    // characters being compared.
    diff |= existingHashedBytes[i] ^ newHash[i]; // eslint-disable-line no-bitwise
  }

  return diff === 0;
};

export const verifyToken = (token: string) => {
  try {
    const { exp } = jwt.verify(token, config.JWT_SECRET_TOKEN) as { exp };
    return Date.now() < exp * 1000;
  } catch {
    return true;
  }
};
