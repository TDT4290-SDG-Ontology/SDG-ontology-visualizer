import requests
import sys
import json

URL = "http://localhost:3001/api"
def goals(municipality):
	req = requests.post(URL + "/gdc/goals", json={ 'municipality': municipality })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

cities = { "osl": "no.0301", "trd": "no.5001" }
municipality = cities[sys.argv[1]]

print("Goals for {}:".format(municipality))
goals(municipality)
