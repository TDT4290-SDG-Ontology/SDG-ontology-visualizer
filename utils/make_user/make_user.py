import sys
import bcrypt
import base64
import requests
import json

BASE_URL = "http://localhost:3001/api"

BCRYPT_SALT_ROUNDS = 12
BCRYPT_HASH_ROUNDS = 10


def login(username, password):
    req = requests.post(
        BASE_URL + "/auth/login", json={"username": username, "password": password}
    )
    print(req.status_code, req.reason)
    print(req.text)
    return json.loads(req.text)


def insert_user(token, username, password, role):
    req = requests.post(
        BASE_URL + "/auth/add-user",
        json={
            "token": token["token"],
            "username": username,
            "password": password,
            "role": role,
        },
    )
    print(req.status_code, req.reason)
    print(req.text)
    return json.loads(req.text)



if len(sys.argv) < 3:
    print("Usage: python make_user.py [username] [password] [role]")
else:
    username = sys.argv[1]
    password = sys.argv[2].encode("utf-8")
    role = sys.argv[3]
    salt = bcrypt.gensalt(rounds=BCRYPT_SALT_ROUNDS)
    hash_val = bcrypt.kdf(
        password=password, salt=salt, desired_key_bytes=64, rounds=BCRYPT_HASH_ROUNDS
    )

    print("Username: {}".format(username))
    print(
        "Password Hash: {}${}${}".format(
            BCRYPT_HASH_ROUNDS,
            base64.b64encode(salt).decode("ascii"),
            base64.b64encode(hash_val).decode("ascii"),
        )
    )
    password_hash = f'${BCRYPT_HASH_ROUNDS}${base64.b64encode(salt).decode("ascii")}${base64.b64encode(hash_val).decode("ascii")}'

    token = login("admin", "admin123")
    print(insert_user(token, username, password_hash, role))