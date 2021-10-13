import requests
import sys
import json

URL = "http://localhost:3001/api"
def goals(municipality):
	req = requests.get(URL + "/gdc/goals/{}".format(municipality))
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

cities = { "osl": "no.0301", "trd": "no.5001", "lnd": "se.1281" }
municipality = cities[sys.argv[1]]

print("Goals for {}:".format(municipality))
goals(municipality)
