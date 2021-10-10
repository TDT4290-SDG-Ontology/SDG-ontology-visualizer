import requests
import sys
import json

URL = "http://localhost:3001/api"
def login(username, password):
	req = requests.post(URL + "/auth/login", json={'username': username, 'password': password })
	print(req.status_code, req.reason)
	print(req.text)
	return json.loads(req.text)

def correlated_kpis(kpi):
	req = requests.post(URL + "/gdc/correlated-kpis", json={'indicator': kpi })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def gdc(municipality, year):
	req = requests.post(URL + "/gdc/get", json={ 'municipality': municipality, 'year': year })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def goals(municipality):
	req = requests.post(URL + "/gdc/goals", json={ 'municipality': municipality })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def similar(municipality):
	req = requests.get(URL + "/municipality/similar/" + municipality)
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def muni_info(muni):
	req = requests.get(URL + "/municipality/info/" + municipality)
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def available_years(muni):
	req = requests.get(URL + "/data/available-years/" + municipality)
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))


# body = login(sys.argv[1], sys.argv[2])
#print("Some correlated kpis:")
#print("EC: ICT: T: 3A")
#correlated_kpis("EC: ICT: T: 3A")
#print("SC: EH: ED: 2C")
#correlated_kpis("SC: EH: ED: 2C")

cities = { "osl": "no.0301", "trd": "no.5001" }

municipality = cities[sys.argv[1]]

#print("GDC output:")
#gdc(municipality, sys.argv[2])

#print("Goals:")
# goals(municipality)

# muni_info(municipality)
available_years(municipality)