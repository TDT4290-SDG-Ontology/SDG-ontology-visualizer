### Password hash generation utility

This utility is made as a stop-gap solution for producing password hashes used for authorization in the data entry API.
Further developments should make this utility unnecessary by implementing a user management UI for admin use.

## Usage

`python make_user.py [username] [password]` (replace `[username]` with the username, and `[password]` with the password).

## Requirements
`bcrypt` version 3.2.0 is a hard requirement, and can be installed by executing `pip install -r requirements.txt`.