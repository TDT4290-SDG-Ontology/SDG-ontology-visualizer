import sys
import bcrypt
import base64

BCRYPT_SALT_ROUNDS = 12
BCRYPT_HASH_ROUNDS = 10

if len(sys.argv) < 3:
	print("Usage: python make_user.py [username] [password]")
else:
	username = sys.argv[1]
	password = sys.argv[2].encode("utf-8")

	salt = bcrypt.gensalt(rounds = BCRYPT_SALT_ROUNDS)
	hash_val = bcrypt.kdf(password = password, salt = salt, desired_key_bytes = 64, rounds = BCRYPT_HASH_ROUNDS)

	print("Username: {}".format(username))
	print("Password Hash: {}${}${}".format(BCRYPT_HASH_ROUNDS, base64.b64encode(salt).decode("ascii"),  base64.b64encode(hash_val).decode("ascii")))
