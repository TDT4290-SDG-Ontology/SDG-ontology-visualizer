import u4ssc

BASE_URL = "http://localhost:3001/api"

def login(username, password):
	req = requests.post(URL + "/auth/login", json={'username': username, 'password': password })
	print(req.status_code, req.reason)
	print(req.text)
	return json.loads(req.text)

# token = login("test", "123");

for ind in u4ssc.indicators:
	print("{}: {}".format(ind.id, ind.produce()))