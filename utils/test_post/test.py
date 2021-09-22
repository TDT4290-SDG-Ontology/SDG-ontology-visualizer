import requests
import sys
import json

URL = "http://localhost:3001/api"
def login(username, password):
	req = requests.post(URL + "/auth/login", json={'username': username, 'password': password })
	print(req.status_code, req.reason)
	print(req.text)
	return json.loads(req.text)

body = login(sys.argv[1], sys.argv[2])
