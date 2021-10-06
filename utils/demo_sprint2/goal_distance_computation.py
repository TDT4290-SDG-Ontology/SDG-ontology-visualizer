import requests
import sys
import json

URL = "http://localhost:3001/api"
def gdc(municipality, year):
	req = requests.post(URL + "/gdc/get", json={ 'municipality': municipality, 'year': year })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

cities = { "osl": "no.0301", "trd": "no.5001" }
municipality = cities[sys.argv[1]]

print("For {} - {}:".format(municipality, sys.argv[2]))
gdc(municipality, sys.argv[2])

