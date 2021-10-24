import u4ssc
import requests
import json
import time
import random

BASE_URL = "http://localhost:3001/api"
SEND_BULK_DATA = True

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

def insert_bulk_data(token, municipality, year, data):
	req = requests.post(BASE_URL + "/data/insert-bulk", json={'token': token["token"], 'municipality': municipality, 'year': year, 'data': data, 'isDummy': True })
	print(req.status_code, req.reason)
	# return json.loads(req.text)

def set_goal(token, municipality, kpi, target, deadline, baseline, baselineYear, start_range, dataseries):
	if dataseries:
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'dataseries': dataseries, 'isDummy': True })
	else:		
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'isDummy': True })
	print(req.status_code, req.reason)

def set_bulk_goals(token, municipality, goals):
	req = requests.post(BASE_URL + "/gdc/set-bulk-goals", json = { 'token': token["token"], 'municipality': municipality, 'goals': goals, 'isDummy': True })
	print(req.status_code, req.reason)

def get_data(kpi):
	req = requests.post(BASE_URL + "/data/get", json={'token': token, 'indicator': kpi })
	print(req.status_code, req.reason)
	return json.loads(req.text)

def get_data(kpi, municipality, year):
    req = requests.post(
        BASE_URL + "/data/get",
        json={
            "token": token,
            "indicator": kpi,
            "municipality": municipality,
            "year": year,
        },
    )
    print(req.status_code, req.reason)
    return json.loads(req.text)

# print(get_data(u4ssc.indicators[0].id))

skip_probability = {
	# code 		goal, 	data series, 	data point
	"se.1281": (0.05, 	0.1, 			0.05),   
	"no.1103": (0.05, 	0.05, 			0.025), 
	"nl.0772": (0.05, 	0.1, 			0.1),  
}

skips = {}

for mun, probs in skip_probability.items():
	ds_skips = []
	prob = skip_probability.get(mun, (-1, -1, -1))
	for ds in u4ssc.all_dataseries:
		if random.uniform(0, 1) < prob[1]:
			ds_skips.append(ds)

	skips[mun] = ds_skips

def generate_goals(token, municipality, goal_goodness):
	if SEND_BULK_DATA:
		goals = []
		for ds in u4ssc.all_dataseries:
			skip_probs = skip_probability.get(municipality, (-1, -1, -1))
			if skip_probs[0] > 0:			
				if random.uniform(0, 1) < skip_probs[0]:
					continue

			goal, deadline, baseline, baselineYear, start_range = ds.generate_goal(goal_goodness)			

			if ds.variant:
				item = {
					'indicator': ds.kpi, 
					'target': goal, 
					'deadline': deadline, 
					'baseline': baseline, 
					'baselineYear': baselineYear, 
					'startRange': start_range, 
					'dataseries': ds.variant 
				}
			else:
				item = {
					'indicator': ds.kpi, 
					'target': goal, 
					'deadline': deadline, 
					'baseline': baseline, 
					'baselineYear': baselineYear, 
					'startRange': start_range, 
				}

			goals.append(item)

		set_bulk_goals(token, municipality, goals)
	else:
		for ds in u4ssc.all_dataseries:
			goal, deadline, baseline, baselineYear, start_range = ds.generate_goal(goal_goodness)
			set_goal(token, municipality, ds.kpi, goal, deadline, baseline, baselineYear, start_range, ds.variant)

def generate_data(token, municipality, goal_goodness, data_goodness, year):
	if SEND_BULK_DATA:
		data = []
		for ds in u4ssc.all_dataseries:
			skip_probs = skip_probability.get(municipality, (-1, -1, -1))
			skip_ds = skips.get(municipality, [])

			if skip_probs[2] > 0:			
				if random.uniform(0, 1) < skip_probs[2]:
					continue
			elif ds in skip_ds:
				continue

			dp = ds.produce_data(goal_goodness, data_goodness, year)
			if ds.variant:
				item = {
					'indicator': ds.kpi, 
					'data': dp, 
					'dataseries': ds.variant 
				}
			else:
				item = {
					'indicator': ds.kpi, 
					'data': dp, 
				}

			data.append(item)

		insert_bulk_data(token, municipality, year, data)
	else:
		for ds in u4ssc.all_dataseries:
			insert_data(token, ds.kpi, ds.produce_data(goal_goodness, data_goodness, year), municipality, year, ds.variant)

token = login("test", "123")

municipalities = {
	# code 		 name 			goal level			data level
	"no.5001": ("Trondheim", 	u4ssc.GOOD, 		u4ssc.GOOD),
	"no.0301": ("Oslo", 		u4ssc.GOOD,			u4ssc.ACCEPTABLE),
	"no.1301": ("Bergen", 		u4ssc.GOOD, 		u4ssc.BAD),
	"no.1103": ("Stavanger", 	u4ssc.GOOD, 		u4ssc.ACCEPTABLE),
	"no.3025": ("Asker", 		u4ssc.GOOD, 		u4ssc.BEST),
	"se.0380": ("Uppsala", 		u4ssc.GOOD, 		u4ssc.ACCEPTABLE),
	"se.1280": ("Malmö", 		u4ssc.ACCEPTABLE, 	u4ssc.TERRIBLE),
	"se.1480": ("Göteborg", 	u4ssc.GOOD, 		u4ssc.GOOD),
	"se.1281": ("Lund", 		u4ssc.GOOD, 		u4ssc.ACCEPTABLE),
	"fi.837":  ("Tampere", 		u4ssc.GOOD, 		u4ssc.ACCEPTABLE),
	"fi.853":  ("Turku", 		u4ssc.BAD, 			u4ssc.TERRIBLE),
	"nl.0080": ("Leeuwarden", 	u4ssc.GOOD, 		u4ssc.GOOD),
	"nl.0268": ("Nijmegen", 	u4ssc.GOOD, 		u4ssc.BEST),
	"nl.0363": ("Amsterdam", 	u4ssc.GOOD, 		u4ssc.BAD),
	"nl.0599": ("Rotterdam", 	u4ssc.ACCEPTABLE, 	u4ssc.ACCEPTABLE),
	"nl.0772": ("Eindhoven", 	u4ssc.GOOD, 		u4ssc.ACCEPTABLE),
	"lt.16":   ("Kaunas",		u4ssc.ACCEPTABLE, 	u4ssc.BAD),
}

print("Generating...")
start = time.time()

for code, v in municipalities.items():
 	name, goal_goodness, data_goodness = v
 	generate_goals(token, code, goal_goodness)

 	print("Generating data for", name)
 	for year in range(2015, 2030 + 1):
 		print(year, " data")
 		generate_data(token, code, goal_goodness, data_goodness, year)

duration = time.time() - start
print("Inserted all goals / data points in {:.2f}s".format(duration))

def test_data_generation():
	def test(goal_goodness, data_goodness, start_range, end_range):
		baseline_pct = max((goal_goodness - 1) / u4ssc.GOODNESS_COUNT, 0.01)
		goal_pct = min((goal_goodness + 1) / u4ssc.GOODNESS_COUNT, 0.99)

		goal = goal_pct * (end_range - start_range) + start_range
		baseline = baseline_pct * (end_range - start_range) + start_range

		penalty_pct = max((1.0 - (data_goodness + 1) / u4ssc.GOODNESS_COUNT), 0.0)

		rate_penalty = 1.0 - penalty_pct * 0.4
		if end_range < start_range:
			rate_penalty = 1.0 + penalty_pct * 0.4

		randomness = max(penalty_pct * 0.15, 0.025)

		if (baseline == 0):
			print("WTF MAN")
			baseline = 0.01

		base = (goal / baseline)
		interest = base * rate_penalty
		print("penalty_pct: {:.2f}, rate_penalty: {:.2f}, interest: {:.4f}, base: {:.4f}, randomness: {:.2f}\n".format(penalty_pct, rate_penalty, interest, base, randomness))

	print("goal: GOOD, data: GOOD, start: 0, end: 100")
	test(u4ssc.GOOD, u4ssc.GOOD, 0, 100)

	print("goal: GOOD, data: GOOD, start: 100, end: 0")
	test(u4ssc.GOOD, u4ssc.GOOD, 100, 0)

	print("goal: GOOD, data: BAD, start: 0, end: 100")
	test(u4ssc.GOOD, u4ssc.BAD, 0, 100)

	print("goal: GOOD, data: BAD, start: 100, end: 0")
	test(u4ssc.GOOD, u4ssc.BAD, 100, 0)

	print("goal: GOOD, data: TERRIBLE, start: 0, end: 100")
	test(u4ssc.GOOD, u4ssc.TERRIBLE, 0, 100)

	print("goal: GOOD, data: TERRIBLE, start: 100, end: 0")
	test(u4ssc.GOOD, u4ssc.TERRIBLE, 100, 0)

	print("goal: BEST, data: TERRIBLE, start: 0, end: 100")
	test(u4ssc.BEST, u4ssc.TERRIBLE, 0, 100)

	print("goal: BEST, data: TERRIBLE, start: 100, end: 0")
	test(u4ssc.BEST, u4ssc.TERRIBLE, 100, 0)

	print("goal: BEST, data: GOOD, start: 0, end: 100")
	test(u4ssc.BEST, u4ssc.GOOD, 0, 100)

	print("goal: BEST, data: GOOD, start: 100, end: 0")
	test(u4ssc.BEST, u4ssc.GOOD, 100, 0)