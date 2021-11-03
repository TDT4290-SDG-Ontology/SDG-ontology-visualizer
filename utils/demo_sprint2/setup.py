import random
import math

import requests
import json

PERCENT = 0
INV_PERCENT = 1

ABSOLUTE = 2
INV_ABSOLUTE = 3

RELATIVE = 4
INV_RELATIVE = 5

BOOL = 6
RATIO = 8
INV_RATIO = 9

TERRIBLE = 0
BAD = 1
ACCEPTABLE = 2
GOOD = 3
BEST = 4
GOODNESS_COUNT = 5

class dataseries:
	def __init__(self, kpi, calc, variant = None, target = None, min_range = None, max_range = None):
		self.kpi = kpi
		self.calc = calc
		self.variant = variant
		self.target = target

		if calc == PERCENT:
			self.start_range = 0
			self.end_range = 100
		elif calc == INV_PERCENT:
			self.start_range = 100
			self.end_range = 0
		elif calc == ABSOLUTE or calc == RELATIVE:
			self.start_range = 0
			self.end_range = 100000
		elif calc == INV_ABSOLUTE or calc == INV_RELATIVE:
			self.start_range = 100000
			self.end_range = 0
		elif calc == RATIO:
			self.start_range = min_range
			self.end_range = max_range
		elif calc == INV_RATIO:
			self.start_range = max_range
			self.end_range = min_range
		elif calc == BOOL:
			self.start_range = 0.0
			self.end_range = 1.0

	def generate_goal(self, goodness):
		baseline_pct = max((goodness - 1) / GOODNESS_COUNT, 0.01)
		min_score_pct = goodness / GOODNESS_COUNT
		goal_pct = (goodness + 1) / GOODNESS_COUNT

		goal = goal_pct * (self.end_range - self.start_range) + self.start_range
		baseline = baseline_pct * (self.end_range - self.start_range) + self.start_range

		return (goal, 2030, baseline, 2015, self.start_range)

	def produce_data(self, goodness, year):
		if self.calc == BOOL:
			return False # TODO: something better....

		baseline_pct = max((goodness - 1) / GOODNESS_COUNT, 0.01)
		min_score_pct = goodness / GOODNESS_COUNT
		goal_pct = (goodness + 1) / GOODNESS_COUNT

		goal = goal_pct * (self.end_range - self.start_range) + self.start_range
		baseline = baseline_pct * (self.end_range - self.start_range) + self.start_range
		min_score = min_score_pct * (self.end_range - self.start_range) + self.start_range

		if (baseline == 0):
			print("WTF MAN")
			baseline = 0.01

		return min_score * (pow((goal / baseline), (year - 2015) / (2030 - 2015)) + random.uniform(-0.025, 0.025))


all_dataseries = [
	dataseries("EN: EN: EQ: 1C", 	PERCENT),
	dataseries("EN: EN: AQ: 2C", 	INV_ABSOLUTE),
	dataseries("EC: I: ES: 3C", 	PERCENT),
	dataseries("SC: EH: ED: 4C", 	PERCENT),
	dataseries("EN: EN: AQ: 1C", 	INV_ABSOLUTE, variant = "no2"),
	dataseries("EN: EN: AQ: 1C", 	INV_ABSOLUTE, variant = "o3"),
	dataseries("EN: EN: AQ: 1C", 	INV_ABSOLUTE, variant = "pm_10"),
	dataseries("EN: EN: AQ: 1C", 	INV_ABSOLUTE, variant = "pm_2.5"),
	dataseries("EN: EN: AQ: 1C", 	INV_ABSOLUTE, variant = "so2"),
	dataseries("EC: I: T: 3C", 		RELATIVE),
	dataseries("SC: SH: SI: 5A", 	PERCENT),
	dataseries("SC: EH: C: 1C", 	PERCENT),
	dataseries("SC: EH: C: 2A", 	RELATIVE),
	dataseries("EC: ICT: ES: 3A", 	PERCENT),
	dataseries("SC: SH: SA: 2C", 	INV_PERCENT),
	dataseries("EN: EN: WS: 1C", 	PERCENT),
	dataseries("EC: ICT: T: 1C", 	PERCENT),
	dataseries("EC: ICT: PS: 2A", 	ABSOLUTE),
	dataseries("EN: E: E: 2C", 		INV_ABSOLUTE),
	dataseries("EC: I: ES: 2C", 	INV_ABSOLUTE),
	dataseries("EC: ICT: ES: 2A", 	PERCENT),
	dataseries("EC: I: B: 2A", 		PERCENT),
	dataseries("EC: I: ES: 1C", 	INV_ABSOLUTE),
	dataseries("SC: EH: ED: 5A", 	PERCENT),
	dataseries("SC: SH: SA: 5A", 	INV_ABSOLUTE),
	dataseries("SC: SH: HO: 2A", 	INV_PERCENT),
	dataseries("SC: SH: SA: 7C", 	RELATIVE),
	dataseries("EC: ICT: ICT: 2C", 	PERCENT),
	dataseries("SC: SH: SA: 1A", 	PERCENT),
	dataseries("EN: EN: WS: 3C", 	INV_PERCENT),
	dataseries("SC: SH: SI: 1C", 	RATIO, target = 1.0, min_range = 0.0, max_range = 2.0),
	dataseries("SC: SH: SI: 2C", 	INV_RATIO, target = 0.0, min_range = 0.0, max_range = 1.0),
	dataseries("EN: EN: PSN: 2A", 	PERCENT),
	dataseries("EN: EN: PSN: 1C", 	ABSOLUTE),
	dataseries("SC: EH: ED: 3C", 	RELATIVE),
	dataseries("EC: ICT: ICT: 1C", 	PERCENT),
	dataseries("EC: I: WS: 5C", 	PERCENT),
	dataseries("EC: P: EM: 4A", 	PERCENT),
	dataseries("SC: EH: H: 4A", 	RELATIVE),
	dataseries("SC: SH: HO: 1C", 	INV_PERCENT),
	dataseries("EC: ICT: T: 3A", 	PERCENT),
	dataseries("SC: EH: H: 1C", 	ABSOLUTE),
	dataseries("EC: I: T: 8A", 		PERCENT),
	dataseries("SC: EH: H: 2C", 	INV_RELATIVE),
	dataseries("SC: SH: SA: 1C", 	INV_RELATIVE),
	dataseries("EN: EN: EQ: 2A", 	INV_PERCENT),
	dataseries("EC: ICT: PS: 1A", 	ABSOLUTE, variant = "number"),
	dataseries("EC: ICT: PS: 1A", 	PERCENT, variant = "percent"),
	dataseries("EC: P: IN: 2C", 	RELATIVE),
	dataseries("EC: I: UP: 1A", 	PERCENT),
	dataseries("SC: EH: H: 3C", 	RELATIVE),
	dataseries("SC: SH: SA: 6C", 	RELATIVE),
	dataseries("SC: SH: SA: 4A", 	INV_PERCENT),
	dataseries("EC: I: WS: 2C", 	PERCENT),
	dataseries("SC: SH: SI: 3C", 	INV_PERCENT),
	dataseries("EN: EN: PSN: 3A", 	PERCENT),
	dataseries("EN: E: E: 4A", 		INV_ABSOLUTE),
	dataseries("EC: I: B: 1A", 		PERCENT),
	dataseries("SC: EH: H: 5A", 	PERCENT),
	dataseries("EC: ICT: PS: 3A", 	PERCENT),
	dataseries("EC: I: T: 2A", 		PERCENT),
	dataseries("EC: I: T: 1C", 		RELATIVE),
	dataseries("EC: P: IN: 1C", 	PERCENT),
	dataseries("EN: EN: PSN: 4A", 	ABSOLUTE),
	dataseries("EN: E: E: 1C", 		PERCENT),
	dataseries("EN: E: E: 3C", 		INV_ABSOLUTE),
	dataseries("SC: SH: SA: 3A", 	BOOL),
	dataseries("SC: EH: ED: 2C", 	PERCENT),
	dataseries("EC: I: T: 6A", 		RELATIVE),
	dataseries("EC: I: T: 7A", 		RELATIVE),
	dataseries("EC: P: IN: 3A", 	PERCENT),
	dataseries("EC: ICT: ES: 1C", 	PERCENT),
	dataseries("EC: ICT: WS: 1C", 	PERCENT),
	dataseries("EC: I: WA: 1C", 	PERCENT),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "burnt"),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "incinerated"),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "landfill"),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "open_dump"),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "other"),
	dataseries("EN: EN: WA: 1C", 	PERCENT, variant = "recycled"),
	dataseries("SC: EH: ED: 1C", 	PERCENT),
	dataseries("EC: P: EM: 3A", 	PERCENT),
	dataseries("SC: SH: SA: 9C", 	INV_RELATIVE),
	dataseries("EC: ICT: T: 2C", 	PERCENT),
	dataseries("EC: I: T: 4A", 		PERCENT, variant = "cycling"),
	dataseries("EC: I: T: 4A", 		PERCENT, variant = "para"),
	dataseries("EC: I: T: 4A", 		PERCENT, variant = "private"),
	dataseries("EC: I: T: 4A", 		PERCENT, variant = "public"),
	dataseries("EC: I: T: 4A", 		PERCENT, variant = "walking"),
	dataseries("EC: I: T: 5A", 		INV_RATIO, target = 1.5, min_range = 0.0, max_range = 20),
	dataseries("EC: P: EM: 1C", 	INV_PERCENT),
	dataseries("EC: I: UP: 2A", 	BOOL, variant = "compact"),
	dataseries("EC: I: UP: 2A", 	BOOL, variant = "connected"),
	dataseries("EC: I: UP: 2A", 	BOOL, variant = "inclusive"),
	dataseries("EC: I: UP: 2A", 	BOOL, variant = "integrated"),
	dataseries("EC: I: UP: 2A", 	BOOL, variant = "resilient"),
	dataseries("SC: SH: SA: 8C", 	INV_RELATIVE),
	dataseries("SC: SH: SI: 4C", 	PERCENT),
	dataseries("EC: I: WS: 4C", 	PERCENT),
	dataseries("EN: EN: WS: 4C", 	PERCENT, variant = "primary"),
	dataseries("EN: EN: WS: 4C", 	PERCENT, variant = "secondary"),
	dataseries("EN: EN: WS: 4C", 	PERCENT, variant = "tertiary"),
	dataseries("EN: EN: WS: 2C", 	INV_ABSOLUTE),
	dataseries("EC: I: WS: 1C", 	PERCENT),
	dataseries("EC: ICT: WS: 2A",	PERCENT),
	dataseries("EC: I: WS: 3C", 	PERCENT),
	dataseries("EC: ICT: D: 1A", 	PERCENT),
	dataseries("EC: ICT: ICT: 5C", 	ABSOLUTE),
	dataseries("EC: ICT: ICT: 3C", 	PERCENT),
	dataseries("EC: ICT: ICT: 4C", 	PERCENT, variant = "3g"),
	dataseries("EC: ICT: ICT: 4C", 	PERCENT, variant = "4g"),
	dataseries("EC: P: EM: 2C", 	INV_PERCENT),
]

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

def generate_goals(token, municipality, goodness):
	for ds in all_dataseries:
		goal, deadline, baseline, baselineYear, start_range = ds.generate_goal(goodness)
		set_goal(token, municipality, ds.kpi, goal, deadline, baseline, baselineYear, start_range, ds.variant)

def generate_data(token, municipality, goodness, year):
	for ds in all_dataseries:
		insert_data(token, ds.kpi, ds.produce_data(goodness, year), municipality, year, ds.variant)

token = login("test", "123")

print("This will take a little while, we're inserting loads of data...")

print("Generating goals")
generate_goals(token, "no.5001", GOOD)
generate_goals(token, "no.0301", GOOD)
# generate_goals(token, "no.1301", u4ssc.GOOD)

print("Generating data for Trondheim")
for year in range(2015, 2030 + 1):
	print(year, " data")
	generate_data(token, "no.5001", GOOD, year)

print("Generating data for Oslo")
for year in range(2015, 2030 + 1):
	print(year, " data")
	generate_data(token, "no.0301", ACCEPTABLE, year)
