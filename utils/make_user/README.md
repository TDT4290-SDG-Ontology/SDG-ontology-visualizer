### Password hash generation utility

This utility is made as a stop-gap solution for producing password hashes used for authorization in the data entry API.
Further developments should make this utility unnecessary by implementing a user management UI for admin use.

## Usage

`python make_user.py [username] [password] [role]` (replace `[username]` with the username, `[password]` with the password, and `[role]` with the role (either `dataentry` or `admin`)).

## Requirements

`bcrypt` version 3.2.0
`requests` version 2.26.0

are hard requirements, and can be installed by executing `pip install -r requirements.txt`.