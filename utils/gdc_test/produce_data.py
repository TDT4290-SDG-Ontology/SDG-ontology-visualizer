import requests
import sys
import json
import random

URL = "http://localhost:3001/api"
def gdc(municipality, year, override):
	req = requests.post(URL + "/gdc/get", json={ 'municipality': municipality, 'year': year, 'goalOverride': override })
	print(req.status_code, req.reason)

municipalities = [
	"no.5001",
	"se.1281",
	"fi.853",
	"nl.0772",
	"lt.16",
]

for mun in municipalities:
	# select random two municipalities to be overrides
	overrides = random.sample(municipalities, 2)	
	if not mun in overrides:
		overrides.append(mun)

	for override in municipalities:
		# do 3 random years, without repeats
		years = random.sample(range(2015, 2030 + 1), 3)
		if not 2020 in years:
			years.append(2020)
			
		for year in years:
			gdc(mun, year, override)

