import u4ssc
import requests
import json

BASE_URL = "http://localhost:3001/api"


def login(username, password):
    req = requests.post(
        BASE_URL + "/auth/login", json={"username": username, "password": password}
    )
    print(req.status_code, req.reason)
    print(req.text)
    return json.loads(req.text)


def insert_data(token, kpi, value, municipality, year, dataseries=None):
    if dataseries:
        req = requests.post(
            BASE_URL + "/data/insert",
            json={
                "token": token["token"],
                "indicator": kpi,
                "data": value,
                "municipality": municipality,
                "year": year,
                "isDummy": True,
                "dataseries": dataseries,
            },
        )
    else:
        req = requests.post(
            BASE_URL + "/data/insert",
            json={
                "token": token["token"],
                "indicator": kpi,
                "data": value,
                "municipality": municipality,
                "year": year,
                "isDummy": True,
            },
        )
    print(req.status_code, req.reason)
    if req.status_code != 200:
        print("kpi: {}, val: {}, ds: {}".format(kpi, value, dataseries))
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


def get_all_data(municipality):
    req = requests.post(
        BASE_URL + "/data/get-all-dataseries",
        json={
            "token": token,
            "municipality": municipality,
        },
    )
    print(req.status_code, req.reason)
    return json.loads(req.text)


def insert_data_for_indicators(token, indicators, municipality, year):
    for ind in indicators:
        for ds in ind.produce():
            if ds[0] == "main":
                insert_data(token, ind.id, ds[1], municipality, year)
            else:
                insert_data(token, ind.id, ds[1], municipality, year, ds[0])


token = login("test", "123")

# insert_data_for_indicators(token, u4ssc.indicators, "no.5001", 2016)
# print(get_data(u4ssc.indicators[0].id, "no.5001", 2015))
# print(get_all_data("no.5001"))
