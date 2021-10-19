import { Buffer } from 'buffer';
import { pbkdf } from 'bcrypt-pbkdf';
import * as jwt from 'jsonwebtoken';
import config from '../config';

/* Composes a hashed password, salt, and number of rounds into one string suitable
 * for storage in databases.
 */
export const encodePasswordHash = (passwordHash: Uint8Array, salt: Uint8Array, rounds: number) => {
  const hashString = Buffer.from(passwordHash).toString('base64');
  const saltString = Buffer.from(salt).toString('base64');

  return `${rounds}$${saltString}$${hashString}`;
};

/* Decomposes a stored hash-string into its component rounds, salt, and hash.
 */
export const decodePasswordHash = (encodedHash: string) => {
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
  existingHashedBytes.forEach((hashedByte, index) => {
    diff |= hashedByte ^ newHash[index]; // eslint-disable-line no-bitwise
  });

  return diff === 0;
};

export const verifyAdminToken = (token: string) => {
  try {
    const decoded: any = jwt.verify(token, config.JWT_SECRET_TOKEN!, { maxAge: '24 hours' });
    return decoded.isAdmin === true;
  } catch {
    return false;
  }
};

export const verifyToken = (token: string) => {
  try {
    return !!jwt.verify(token, config.JWT_SECRET_TOKEN!, { maxAge: '24 hours' });
  } catch {
    return false;
  }
};
