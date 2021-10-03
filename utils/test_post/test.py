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
	req = requests.post(URL + "/gdc/correlated-kpis", json={'kpi': kpi })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

def gdc(municipality, year):
	req = requests.post(URL + "/gdc/get", json={'municipality': municipality, 'year': year })
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

# body = login(sys.argv[1], sys.argv[2])
correlated_kpis("EC: ICT: T: 3A")
gdc("no.5001", 2014)
