import requests
import sys
import json

URL = "http://localhost:3001/api"
def correlated_kpis(kpi):
	req = requests.get(URL + "/gdc/correlated-kpis/{}".format(kpi))
	print(req.status_code, req.reason)
	parsed = json.loads(req.text)
	print(json.dumps(parsed, indent = 4))

if (len(sys.argv) < 2):
	print("Correlated kpis for 'EC: ICT: T: 3A':")
	correlated_kpis("EC: ICT: T: 3A")

	print("For 'SC: EH: ED: 2C':")
	correlated_kpis("SC: EH: ED: 2C")
else:
	print("For '{}':".format(sys.argv[2]))
	correlated_kpis(sys.argv[2])
