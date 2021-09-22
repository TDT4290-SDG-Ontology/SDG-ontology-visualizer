import u4ssc
import requests
import json

BASE_URL = "http://localhost:3001/api"

def login(username, password):
	req = requests.post(BASE_URL + "/auth/login", json={'username': username, 'password': password })
	print(req.status_code, req.reason)
	print(req.text)
	return json.loads(req.text)

def insert_data(token, kpi, value, municipality, year):
	req = requests.post(BASE_URL + "/dataEntry/testInput", json={'token': token, 'indicator': kpi, 'data': value, 'municipality': municipality, 'year': year, 'isDummy': true })
	print(req.status_code, req.reason)
	return json.loads(req.text)

token = login("test", "123");

for ind in u4ssc.indicators:
	print("{}: {}".format(ind.id, ind.produce()))

