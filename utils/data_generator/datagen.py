import u4ssc
import requests
import json
import uuid

BASE_URL = "http://localhost:3001/api"

def login(username, password):
	req = requests.post(BASE_URL + "/auth/login", json={'username': username, 'password': password })
	print(req.status_code, req.reason)
	print(req.text)
	return json.loads(req.text)

def insert_data(token, kpi, value, municipality, year, dataseries = None):
	if dataseries:
		req = requests.post(BASE_URL + "/data/insert", json={'token': token["token"], 'indicator': kpi, 'data': value, 'municipality': municipality, 'year': year, 'isDummy': True, 'dataseries': dataseries })
	else:
		req = requests.post(BASE_URL + "/data/insert", json={'token': token["token"], 'indicator': kpi, 'data': value, 'municipality': municipality, 'year': year, 'isDummy': True })
	print(req.status_code, req.reason)
	if req.status_code != 200:
		print("kpi: {}, val: {}, ds: {}".format(kpi, value, dataseries))
	return json.loads(req.text)

def set_goal(token, municipality, kpi, target, deadline, baseline, baselineYear, start_range, dataseries):
	if dataseries:
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'dataseries': dataseries, 'isDummy': True })
	else:		
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'isDummy': True })
	print(req.status_code, req.reason)
	if req.status_code != 200:
		print("kpi: {}".format(json["indicator"]))

def get_data(kpi):
	req = requests.post(BASE_URL + "/data/get", json={'token': token, 'indicator': kpi })
	print(req.status_code, req.reason)
	return json.loads(req.text)

def insert_data_for_indicators(token, indicators, municipality, year):
	for ind in indicators:
		for ds in ind.produce():
			if ds[0] == 'main':
				insert_data(token, ind.id, ds[1], municipality, year)
			else:
				insert_data(token, ind.id, ds[1], municipality, year, ds[0])

token = login("test", "123");

# print(get_data(u4ssc.indicators[0].id))

def generate_goals(token, municipality, goodness):
	for ds in u4ssc.all_dataseries:
		goal, deadline, baseline, baselineYear, start_range = ds.generate_goal(goodness)
		set_goal(token, municipality, ds.kpi, goal, deadline, baseline, baselineYear, start_range, ds.variant)

def generate_data(token, municipality, goodness, year):
	for ds in u4ssc.all_dataseries:
		insert_data(token, ds.kpi, ds.produce_data(goodness, year), municipality, year, ds.variant)

generate_goals(token, "no.5001", u4ssc.GOOD)
# generate_goals(token, "no.0301", u4ssc.GOOD)
# generate_goals(token, "no.1301", u4ssc.GOOD)

#for year in range(2015, 2021):
#	print(year, " data")
#	generate_data(token, "no.5001", u4ssc.GOOD, year)
