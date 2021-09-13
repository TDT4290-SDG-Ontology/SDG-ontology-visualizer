import { Buffer } from 'buffer';
import { pbkdf } from 'bcrypt-pbkdf';
import * as jwt from 'jsonwebtoken';

import 'jest';

/* Checks if a password matches a provided hash, returning true if it did.
 * 'password' *must* be a utf-8 encoded string, whilst 'existing_hash' *must* be an ascii encoded string.
 */
export const checkPassword = (password: string, existing_hash: string) => {

	// This is *meant* to be slow. In fact, the slowness is built into the algorithm.
	// The reason this is slow is because it is used in order to reduce the efficacy of 
	// brute force attacks. The slowness is controlled by the 'rounds' parameter. 

	const decoded_hash = decodePasswordHash(existing_hash);

	var new_hash: Uint8Array = new Uint8Array(decoded_hash.hash.length);
	const password_bytes: Uint8Array = new Uint8Array(Buffer.from(password, 'utf-8'));

	pbkdf(password_bytes, password_bytes.length, 
						decoded_hash.salt, decoded_hash.salt.length, 
						new_hash, new_hash.length, decoded_hash.rounds);

	// This comparison is done somewhat obtusely in order to thwart timing attacks
	// against the password comparison which earlying-out would allow. With a vulnerable
	// comparison, an attacker could, by timing the differences in response time, derive
	// passwords one character at a time.
	//
	// As it stands, the only length dependent operation in this comparison is
	// generating the hash for the password being tested.

	const existing_hashed_bytes = decoded_hash.hash;
	var diff = new_hash.length ^ existing_hashed_bytes.length; // This *should* be 0, as we use a
	for (var i = 0; i < existing_hashed_bytes.length; i++) {
		// The bitwise XOR finds the bitwise difference between the 
		// characters being compared.
		diff |= existing_hashed_bytes[i] ^ new_hash[i];
	}

	return diff === 0;
}

/* Composes a hashed password, salt, and number of rounds into one string suitable
 * for storage in databases.
 */
const encodePasswordHash = (passwordHash: Uint8Array, salt: Uint8Array, rounds: number) => {

	const hashString = Buffer.from(passwordHash).toString('base64');
	const saltString = Buffer.from(salt).toString('base64');

	return `${rounds}$${saltString}$${hashString}`
}

/* Decomposes a stored hash-string into its component rounds, salt, and hash.
 */
const decodePasswordHash = (encodedHash: string) => {
	
	// Hash format: {rounds}${salt}${hash}
	// both salt and hash are base64 encoded, so there's no crash with the separators!

	const parts: string[] = encodedHash.split('$');

	const rounds: number = parseInt(parts[0]);
	const salt: Uint8Array = Buffer.from(parts[1], 'base64');
	const hashed_bytes: Uint8Array = Buffer.from(parts[2], 'base64');

	return { rounds: rounds, salt: salt, hash: hashed_bytes };
}

export const isExpiredToken = (token: string) => {
	try {
		const { exp } = jwt.decode(token) as { exp };
		return Date.now() >= exp * 1000;
	} catch {
		return true;
	}
}

/*
describe('Password Hash test' () => {
	const pw_hash1 = "100$JDJiJDEyJFlNNThndGpsMnVPMFl2VEd0Q0wvUnU=$sTCG+aG52QgpLNQi69HP4xkiwyXhDESsHsCW96nKzbd+R1uV0Mby8impiZykRlzOA3yohARc6KCPB8nBsRyijQ==";
	const pw_hash2 = "100$JDJiJDEyJDJmQURWbkdQc0t4V0lYL3czT0pBUi4=$UE8k6d7Ska1x8ffgrJb96FU+gLg6k3amiBxOHXcVEB/KER0UYHpUH4TkpkW0uQm3RYGn23E1stATzNy91BCguQ==";

  	it('should test checkPassword for instances', () => {
    	expect(checkPassword("123", pw_hash1)).toBe(true);
    	expect(checkPassword("321", pw_hash1)).toBe(false);
    	expect(checkPassword("123", pw_hash2)).toBe(false);
    	expect(checkPassword("321", pw_hash2)).toBe(true);
  	})
})

*/