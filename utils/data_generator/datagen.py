import u4ssc
import requests
import json
import time
import random
import sys

BASE_URL = "http://localhost:3001/api"
SEND_BULK_DATA = True
PRODUCE_OWL = "rdf" in sys.argv

all_goals = []
all_data = []

def login(username, password):
	req = requests.post(BASE_URL + "/auth/login", json={'username': username, 'password': password })
	if not PRODUCE_OWL:
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
	if (req.status_code != 200):
		print(req.text)

def set_goal(token, municipality, kpi, target, deadline, baseline, baselineYear, start_range, dataseries):
	if dataseries:
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'dataseries': dataseries, 'isDummy': True })
	else:		
		req = requests.post(BASE_URL + "/gdc/set-goal", json = { 'token': token["token"], 'indicator': kpi, 'municipality': municipality, 'target': target, 'deadline': deadline, 'baseline': baseline, 'baselineYear': baselineYear, 'startRange': start_range, 'isDummy': True })
	print(req.status_code, req.reason)

def set_bulk_goals(token, municipality, goals):
	req = requests.post(BASE_URL + "/gdc/set-bulk-goals", json = { 'token': token["token"], 'municipality': municipality, 'goals': goals, 'isDummy': True })
	print(req.status_code, req.reason)
	if (req.status_code != 200):
		print(req.text)

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


def rdf_goal(muni, goal):

	kpi = goal['indicator']
	dataseries = u4ssc.friendly_names[kpi]	
	if 'dataseries' in goal:
		dataseries = "{}.{}".format(dataseries, goal['dataseries'])

	# <http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.${dataseries}.${goal.municipality}>
	# <http://www.semanticweb.org/aga/ontologies/2017/9/SDG#dataseries.${dataseries}>

	return """    <!-- http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.{dataseries}.{municipality} -->

    <owl:NamedIndividual rdf:about="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#goals.u4ssc.{dataseries}.{municipality}">
        <rdf:type rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#U4SSCIndicatorGoal"/>
        <SDG:isGoalForMunicipality rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#municipality.{municipality}"/>
        <SDG:isGoalForDataseries rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#dataseries.{dataseries}"/>
        <SDG:goalStartRange rdf:datatype="http://www.w3.org/2001/XMLSchema#double">{start_range}</SDG:goalStartRange>
        <SDG:goalTarget rdf:datatype="http://www.w3.org/2001/XMLSchema#double">{target}</SDG:goalTarget>
        <SDG:goalDeadline rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">{deadline}</SDG:goalDeadline>
        <SDG:goalBaseline rdf:datatype="http://www.w3.org/2001/XMLSchema#double">{baseline}</SDG:goalBaseline>
        <SDG:goalBaselineYear rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">{baseline_year}</SDG:goalBaselineYear>
        <SDG:isDummyData rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</SDG:isDummyData>
    </owl:NamedIndividual>
""".format(dataseries = dataseries, 
		   municipality = muni, 
		   start_range = float(goal["startRange"]), 
		   target = float(goal["target"]), 
		   deadline = int(goal["deadline"]), 
		   baseline = float(goal["baseline"]), 
		   baseline_year = int(goal["baselineYear"]))

def rdf_data(muni, year, data):	
	kpi = data['indicator']
	dataseries = u4ssc.friendly_names[kpi]
	if 'dataseries' in data:
		dataseries = "{}.{}".format(dataseries, data['dataseries'])

	return """    <!-- http://www.semanticweb.org/aga/ontologies/2017/9/SDG#datapoint.u4ssc.{dataseries}.{municipality}.{year} -->

    <owl:NamedIndividual rdf:about="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#datapoint.u4ssc.{dataseries}.{municipality}.{year}">
        <rdf:type rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#Datapoint"/>
        <SDG:datapointForMunicipality rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#municipality.{municipality}"/>
        <SDG:datapointForSeries rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#dataseries.{dataseries}"/>
        <SDG:datapointValue rdf:datatype="http://www.w3.org/2001/XMLSchema#double">{value}</SDG:datapointValue>
        <SDG:datapointYear rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">{year}</SDG:datapointYear>
        <SDG:isDummyData rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</SDG:isDummyData>
    </owl:NamedIndividual>
""".format(dataseries = dataseries, 
		   municipality = muni, 
		   year = int(year), 
		   value = float(data["data"]))

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

		if PRODUCE_OWL:
			all_goals.append({
				'municipality': municipality,
				'goals': goals,
				})
		else:
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

		if PRODUCE_OWL:
			all_data.append({
				'municipality': municipality,
				'year': year,
				'data': data,
				})
		else:
			insert_bulk_data(token, municipality, year, data)
	else:
		for ds in u4ssc.all_dataseries:
			insert_data(token, ds.kpi, ds.produce_data(goal_goodness, data_goodness, year), municipality, year, ds.variant)

if not PRODUCE_OWL:
	token = login("test", "123")
else: 
	token = ""

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

if not PRODUCE_OWL:
	print("Generating...")

start = time.time()

for code, v in municipalities.items():
 	name, goal_goodness, data_goodness = v
 	generate_goals(token, code, goal_goodness)

 	if not PRODUCE_OWL:
 		print("Generating data for", name)

 	for year in range(2015, 2030 + 1):
 		if not PRODUCE_OWL:
	 		print(year, " data")

 		generate_data(token, code, goal_goodness, data_goodness, year)

if PRODUCE_OWL:
	file_content = """<?xml version="1.0"?>
<rdf:RDF xmlns="http://www.semanticweb.org/aga/ontologies/2017/9/untitled-ontology-9"
     xml:base="http://www.semanticweb.org/aga/ontologies/2017/9/untitled-ontology-9"
     xmlns:SDG="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
     xmlns:xml="http://www.w3.org/XML/1998/namespace"
     xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:skos="http://www.w3.org/2004/02/skos/core#"
     xmlns:terms="http://purl.org/dc/terms/"
     xmlns:schema="http://schema.org/"
     xmlns:ontology="http://metadata.un.org/sdg/ontology#">
	"""

	for goal_pkg in all_goals:
		file_content += "\n".join([ rdf_goal(goal_pkg["municipality"], goal) for goal in goal_pkg["goals"] ])

	for data_pkg in all_data:
		file_content += "\n".join([ rdf_data(data_pkg["municipality"], data_pkg["year"], data) for data in data_pkg["data"]])

	file_content += "\n</rdf:RDF>"

	print(file_content)

duration = time.time() - start
if not PRODUCE_OWL:
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