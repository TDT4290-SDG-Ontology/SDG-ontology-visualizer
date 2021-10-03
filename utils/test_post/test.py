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
	endpoint_url = URL + "/gdc/correlated-kpis"
	print(endpoint_url)
	req = requests.post(endpoint_url, json={'kpi': kpi })
	print(req.status_code, req.reason)
	print(req.text)

# body = login(sys.argv[1], sys.argv[2])
correlated_kpis("EC: ICT: T: 3A")
