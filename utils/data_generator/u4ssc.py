import random
import math

class Generator:
	def __init__(self, lower_limit, upper_limit, dataset):
		self.lower_limit = lower_limit
		self.upper_limit = upper_limit
		self.dataset = dataset

	def produce(self):
		return random.uniform(self.lower_limit, self.upper_limit)

class BoolGenerator:
	def __init__(self, dataset):
		self.dataset = dataset

	def produce(self):
		return random.randint(0, 1)

class IndicatorGenerator:
	def __init__(self, ind_id, gens, lower_limit, upper_limit, is_boolean = False):
		self.id = ind_id
		if not is_boolean:
			self.gens = [ Generator(lower_limit, upper_limit, g) for g in gens ]
		else:
			self.gens = [ BoolGenerator(g) for g in gens ]

	def produce(self):
		return [ (g.dataset, g.produce()) for g in self.gens ]

class IndicatorGeneratorSet:
	def __init__(self, ind_id, gens):
		self.id = ind_id
		self.gens = gens

	def produce(self):
		arr = []
		for g in self.gens:
			arr.extend(g.produce())
		return arr

ABS_LIMIT = 2 ** 32 - 1

# n %
def pct(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, 100)

def pct_abs(id, name, desc = "", **kwargs):
	return IndicatorGeneratorSet(id, [IndicatorGenerator(id, ["percent"], 0, 100), IndicatorGenerator(id, ["number"], 0, ABS_LIMIT)])

# n
def abs(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, ABS_LIMIT)

# n / 100 000 inhabitants
def rel(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, 100000)

def ratio(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, ABS_LIMIT)

def avg(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, ABS_LIMIT)

def yes_no(id, name, desc = "", **kwargs):
	return IndicatorGenerator(id, kwargs.get("datasets", ["main"]), 0, 1, True)

indicators = [
	# Economics
	pct("EC: ICT: ICT: 1C", 	"Household internet access"),
	pct("EC: ICT: ICT: 2C", 	"Fixed broadband subscriptions", "Percentage of households with fixed (wired) broadband"),
	rel("EC: ICT: ICT: 3C", 	"Wireless broadband subscriptions"),
	pct("EC: ICT: ICT: 4C", 	"Wireless broadband coverage", "Percentage of city served by wireless broadband, per tech", datasets = ["3g", "4g"]),
	abs("EC: ICT: ICT: 5C", 	"Availability of WIFI in public areas", "Number of public WIFI hotspots in city"),
	pct("EC: ICT: WS: 1C", 		"Smart water meters", "Percentage implementation of smart water meters"),
	pct("EC: ICT: WS: 2A",  	"Water and sanitation", "Percentage of water distribution system monitored by ICT"),
	pct("EC: ICT: D: 1A",		"Drainage / storm water system ICT monitoring"),
	pct("EC: ICT: ES: 1C",  	"Smart electricity meters"),
	pct("EC: ICT: ES: 2A", 		"Electricty supply ICT monitoring"),
	pct("EC: ICT: ES: 3A", 		"Demand response penetration", "Percentage of electricity customers with demand response capabilities"),
	pct("EC: ICT: T: 1C", 		"Dynamic public transport information", "Percentage of urban public transport stops for which traveller information is dynamically available to the public in real time."),
	pct("EC: ICT: T: 2C", 		"Traffic monitoring", "Percentage of major streets monitored by ICT"),
	pct("EC: ICT: T: 3A",		"Intersection control", "Percentage of road intersections using adaptive traffic control or prioritization measures"),
	pct_abs("EC: ICT: PS: 1A", 	"Open data", "Percentage and number of inventoried open datasets that are published"),
	abs("EC: ICT: PS: 2A",		"e-Government", "Number of public services delivered through electronic means"),
	pct("EC: ICT: PS: 3A",		"Public sector e-procurement", "Percentage of public sector procurement activities that are conducted electronically"),
	pct("EC: P: IN: 1C", 		"R&D expenditure", "Research and Development expenditure as a percentage of city GDP"),
	rel("EC: P: IN: 2C", 		"Patents", "Number of new patents granted per 100,000 inhabitants per year"),
	pct("EC: P: IN: 3A",		"Small and medium-sized enterprises"),
	pct("EC: P: EM: 1C",		"Unemployment rate"),
	pct("EC: P: EM: 2C",		"Youth unemployment rate"),
	pct("EC: P: EM: 3A",		"Tourism industry employment"),
	pct("EC: P: EM: 4A",		"ICT sector employment"),
	pct("EC: I: WS: 1C",		"Basic water supply", "Percentage of city households with access to a basic water supply"),
	pct("EC: I: WS: 2C",		"Potable water supply", "Percentage of households with a safely managed drinking water service"),
	pct("EC: I: WS: 3C",		"Water supply loss"),
	pct("EC: I: WS: 4C",		"Wastewater collection"),
	pct("EC: I: WS: 5C",		"Household sanitation", "Percentage of the city households with access to basic sanitation facilities"),
	pct("EC: I: WA: 1C",		"Solid waste collection", "Percentage of city households with regular solid waste collection"),	
	avg("EC: I: ES: 1C",		"Electricity system outage frequency", "Average number of electrical interruptions per customer per year"),
	avg("EC: I: ES: 2C",		"Electricity system outage time", "Average length of electrical interruptions"),
	pct("EC: I: ES: 3C",		"Access to electricity", "Percentage of households with authorized access to electricity"),
	rel("EC: I: T: 1C",			"Public transport network", "Length of public transport network per 100,000 inhabitants"),
	pct("EC: I: T: 2A",			"Public transport network convenience", "Percentage of the city population that has convenient access (within 0.5 km) to public transport"),
	rel("EC: I: T: 3C",			"Bicycle network", "Length of bicycle paths and lanes per 100,000 population"),
	pct("EC: I: T: 4A",			"Transportation mode share", "The percentage of people using various forms of transportation to travel to work", datasets = ["public", "personal", "cycling", "walking", "para"]),
	ratio("EC: I: T: 5A",		"Travel time index", "Ratio of travel time during peak periods to travel time at free flow periods"),
	rel("EC: I: T: 6A", 		"Shared bicyles"),
	rel("EC: I: T: 7A",			"Shared vehicles"),
	pct("EC: I: T: 8A",			"Low-carbon emission passenger vehicles"),
	pct("EC: I: B: 1A",			"Public building sustainability", "Percentage area of public buildings with recognized sustainability certifications for ongoing operations"),
	pct("EC: I: B: 2A", 		"Integrated building management systems in public buildings", "Percentage of public buildings using integrated ICT systems to automate building management and create flexible, effective, comfortable and secure environment"),
	pct("EC: I: UP: 1A",		"Pedestrian infrastructure", "Percentage of the city designated as a pedestrian/car free zone"),
	yes_no("EC: I: UP: 2A",		"Urban development and spatial planning", "Existence of urban development and spatial planning strategies or documents at the city level", datasets = ["compact", "connected", "integrated", "inclusive", "resilient"]),


	# Environmental
	avg("EN: EN: AQ: 1C",		"Air Pollution", "Air quality index (AQI) based on reported value", datasets = ["pm_10", "pm_2.5", "no2", "so2", "o3"]),
	avg("EN: EN: AQ: 2C",		"Greenhouse gas emissions", "Greenhouse gas (GHG) emissions per capita (Tonnes eCO2 / capita)"),
	pct("EN: EN: WS: 1C",		"Drinking water quality", "Percentage of households covered by an audited Water Safety Plan"),
	avg("EN: EN: WS: 2C",		"Water consumption", "Total water consumption per capita"),
	pct("EN: EN: WS: 3C",		"Fresh water consumption", "Percentage of water consumed from freshwater sources"),
	pct("EN: EN: WS: 4C",		"Wastewater treatment", "Percentage of wastewater receiving treatment (Primary, Secondary, Tertiary)", datasets=["primary", "secondary", "tertiary"]),
	pct("EN: EN: WA: 1C",		"Solid waste treatment", "Percentage of solid waste dealt with, according to disposal method", datasets = ["landfill", "burnt", "incinerated", "open_dump", "recycled", "other"]),
	pct("EN: EN: EQ: 1C",		"EMF exposure", "Percentage of mobile network antenna sites in compliance with WHO endorsed Electromagnetic Fields (EMF) exposure guidelines"),
	pct("EN: EN: EQ: 2A",		"Noise exposure", "Percentage of city inhabitants exposed to excessive noise levels"),
	rel("EN: EN: PSN: 1C",		"Green areas"),
	pct("EN: EN: PSN: 2A", 		"Green area accessibility", "Percentage of inhabitants with accessibility to green areas"),
	pct("EN: EN: PSN: 3A",		"Protected natural areas", "Percentage of city area protected as natural sites"),
	rel("EN: EN: PSN: 4A",		"Recreational facilities", "Area of total public recreational facilities per 100,000 inhabitants"),
	pct("EN: E: E: 1C", 		"Renewable energy consumption"),
	avg("EN: E: E: 2C",			"Electric consumption", "Electricity consumption per capita (kWh / year / capita)"),
	avg("EN: E: E: 3C",			"Resident thermal energy consumption", "Residential thermal energy consumption per capita (GJ / year / capita)"),
	abs("EN: E: E: 4A", 		"Public building energy consumption", "Annual energy consumption of public buildings (e-kWh / m^2 / year)"),

 	 
 	# Society and Culture
 	pct("SC: EH: ED: 1C",		"Student ICT Access", "Percentage of students with classroom access to ICT facilities"),
 	pct("SC: EH: ED: 2C",		"School enrollment", "Percentage of school-aged population enrolled in school"),
	rel("SC: EH: ED: 3C",		"Higher education degrees"),
	pct("SC: EH: ED: 4C",		"Adult literacy"),
	pct("SC: EH: ED: 5A",		"Electronic health records", "The percentage of city inhabitants with complete health records electronically accessible to all health providers"),
	abs("SC: EH: H: 1C",		"Life expectancy"),
	rel("SC: EH: H: 2C",		"Maternal mortality rate"),
	rel("SC: EH: H: 3C",		"Physicians"),
	rel("SC: EH: H: 4A",		"In-patient hospital beds"),
	pct("SC: EH: H: 5A",		"Health insurance / public health coverage"),
	pct("SC: EH: C: 1C",		"Cultural expenditure", "Percentage expenditure on city cultural heritage"),
	rel("SC: EH: C: 2A",		"Cultural infrastructure", "Number of the cultural institutions per 100,000 inhabitants"),
	pct("SC: SH: HO: 1C",		"Informal settlements", "Percentage of city inhabitants living in slums, informal settlements or inadequate housing"),
	pct("SC: SH: HO: 2A",		"Expenditure on Housing", "Percentage share of income expenditure for housing"),
	ratio("SC: SH: SI: 1C",		"Gender income equality", "Ratio of average hourly earnings of female to male workers"),
	abs("SC: SH: SI: 2C",		"Gini coefficient", "Income distribution in accordance with Gini coefficient"),
	pct("SC: SH: SI: 3C",		"Poverty share", "Percentage of city inhabitants living in income poverty"),
	pct("SC: SH: SI: 4C", 		"Voter participation", "Percentage of the eligible population that voted during the last municipal election"),
	pct("SC: SH: SI: 5A",		"Child care availability", "Percentage of pre-school age children (0-3) covered by (public and private) day-care centres"),
	rel("SC: SH: SA: 1C", 		"Natural disaster related deaths"),
	pct("SC: SH: SA: 2C",		"Disaster-related economic losses", "Economic losses (related to natural disasters) as a percentage of the city's gross domestic product (GDP)"),
	yes_no("SC: SH: SA: 3A", 	"Resilience plans", "This involves implementation of risk and vulnerability assessments, financial (capital and operating) plans and technical systems for disaster mitigation addressing natural and human induced disasters and hazards"),
	pct("SC: SH: SA: 4A",		"Population living in disaster prone areas"),
	abs("SC: SH: SA: 5A", 		"Emergency service response time"),
	rel("SC: SH: SA: 6C", 		"Police service", "Number of police officers per 100,000 inhabitants"),
	rel("SC: SH: SA: 7C",		"Fire service", "Number of firefighters per 100,000 inhabitants"),
	rel("SC: SH: SA: 8C", 		"Violent crime rate"),
	rel("SC: SH: SA: 9C",		"Traffic fatailities"),
	pct("SC: SH: FS: 1A",		"Local food production", "Percentage of local food supplied from within 100 km of the urban area"),
]

# wrongly entered in airtable:
# SC: EH: ED: 1C
# SC: EH: ED: 2C
# SC: EH: H: 1C
# SC: EH: H: 3C
# SC: EH: C: 1C

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

	def produce_data(self, goal_goodness, data_goodness, year, growth_penalty = 0.4):
		if self.calc == BOOL:
			return False # TODO: something better....

		baseline_pct = max((goal_goodness - 1) / GOODNESS_COUNT, 0.01)
		goal_pct = (goal_goodness + 1) / GOODNESS_COUNT

		goal = goal_pct * (self.end_range - self.start_range) + self.start_range
		baseline = baseline_pct * (self.end_range - self.start_range) + self.start_range

		penalty_pct = max((1.0 - (data_goodness + 1) / GOODNESS_COUNT), 0.0)
		rate_penalty = 1.0 - penalty_pct * growth_penalty

		if self.calc == INV_RELATIVE or self.calc == INV_ABSOLUTE or self.calc == INV_PERCENT or self.calc == INV_RATIO:
			rate_penalty = 1.0 + penalty_pct * growth_penalty

		randomness = max(penalty_pct * 0.175, 0.025)

		if (baseline == 0):
			print("WTF MAN")
			baseline = 0.01

		interest = (goal / baseline) * rate_penalty

		if (interest < 0):
			print("WTF MAN")
			print(interest, goal, baseline, rate_penalty, penalty_pct)

		if year == 2015:
			return baseline

		return baseline * (pow(interest, (year - 2015) / (2030 - 2015)) + random.uniform(-randomness, randomness))


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
	dataseries("SC: SH: FS: 1A", 	PERCENT),
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

friendly_names = dict([
	('EC: ICT: ICT: 1C', 'household_internet_access'),
  	('EC: P: EM: 1C', 'unemployment_rate'),
	('EC: P: IN: 2C', 'patents'),
	('EN: EN: EQ: 1C', 'EMF_exposure'),
	('EN: EN: AQ: 2C', 'GHG_emissions'),
	('EC: I: ES: 3C', 'access_electricity'),
	('SC: EH: ED: 4C', 'adult_literacy'),
	('EN: EN: AQ: 1C', 'air_pollution'),
	('EC: I: T: 3C', 'bicycle_network'),
	('SC: SH: SI: 5A', 'child_care_availability'),
	('SC: EH: C: 1C', 'cultural_expenditure'),
	('SC: EH: C: 2A', 'cultural_infrastructure'),
	('EC: ICT: ES: 3A', 'demand_response_penetration'),
	('SC: SH: SA: 2C', 'disaster_related_economic_loss'),
	('EN: EN: WS: 1C', 'drinking_water_quality'),
	('EC: ICT: T: 1C', 'dynamic_public_trans_inf'),
	('EC: ICT: PS: 2A', 'e_government'),
	('EN: E: E: 2C', 'electricity_consumption'),
	('EC: I: ES: 2C', 'electricity_outage_time'),
	('EC: ICT: ES: 2A', 'electricity_supply_ict_mon'),
	('EC: I: ES: 1C', 'electricity_system_outage_freq'),
	('SC: EH: ED: 5A', 'electronic_health_records'),
	('SC: SH: SA: 5A', 'emergency_response_time'),
	('SC: SH: HO: 2A', 'expenditure_housing'),
	('SC: SH: SA: 7C', 'fire_service'),
	('EC: ICT: ICT: 2C', 'fixed_broadband'),
	('SC: SH: FS: 1A', 'food_production'),
	('EN: EN: WS: 4C', 'wastewater_treatment'),
	('SC: SH: SI: 1C', 'gender_income_equality'),
	('SC: SH: SI: 2C', 'gini_coefficient'),
	('EN: EN: PSN: 2A', 'green_area_accessibility'),
	('EN: EN: PSN: 1C', 'green_areas'),
	('SC: EH: ED: 3C', 'higher_education_degrees'),
	('EC: I: WS: 5C', 'household_sanitation'),
	('EC: P: EM: 4A', 'ict_sector_employment'),
	('SC: EH: H: 4A', 'in_patient_hospital_beds'),
	('SC: SH: HO: 1C', 'informal_settlements'),
	('EC: I: B: 2A', 'integrated_building_management_systems'),
	('EC: ICT: T: 3A', 'intersection_control'),
	('SC: EH: H: 1C', 'life_expectancy'),
	('EC: I: T: 8A', 'low_carbon_passenger_vehicles'),
	('SC: EH: H: 2C', 'maternal_mortality_rate'),
	('SC: SH: SA: 1C', 'natural_disaster_related_deaths'),
	('EN: EN: EQ: 2A', 'noise_exposure'),
	('EC: ICT: PS: 1A', 'open_data'),
	('EC: I: UP: 1A', 'pedestrian_infrastructure'),
	('SC: EH: H: 3C', 'physicians'),
	('SC: SH: SA: 6C', 'police_service'),
	('SC: SH: SA: 4A', 'population_disaster_prone_areas'),
	('EC: I: WS: 2C', 'potable_water_supply'),
	('SC: SH: SI: 3C', 'poverty_share'),
	('EN: EN: PSN: 3A', 'protected_natural_areas'),
	('EN: E: E: 4A', 'public_building_energy_consumption'),
	('EC: I: B: 1A', 'public_building_sustainability'),
	('SC: EH: H: 5A', 'public_health_coverage'),
	('EC: ICT: PS: 3A', 'public_sector_e_procurement'),
	('EC: I: T: 2A', 'public_transport_convenience'),
	('EC: I: T: 1C', 'public_transport_network'),
	('EC: P: IN: 1C', 'r_d_expenditure'),
	('EN: EN: PSN: 4A', 'recreational_facilities'),
	('EN: E: E: 1C', 'renewable_energy_consumption'),
	('EN: E: E: 3C', 'residential_thermal_energy_consumption'),
	('SC: SH: SA: 3A', 'resilience_plans'),
	('SC: EH: ED: 2C', 'school_enrolment'),
	('EC: I: T: 6A', 'shared_bicycles'),
	('EC: I: T: 7A', 'shared_vehicles'),
	('EC: P: IN: 3A', 'small_medium_enterprises'),
	('EC: ICT: ES: 1C', 'smart_electricity_meters'),
	('EC: ICT: WS: 1C', 'smart_water_meters'),
	('EC: I: WA: 1C', 'solid_waste_collection'),
	('EN: EN: WA: 1C', 'solid_waste_treatment'),
	('SC: EH: ED: 1C', 'student_ICT_access'),
	('EC: P: EM: 3A', 'tourism_industry_employment'),
	('SC: SH: SA: 9C', 'traffic_fatalities'),
	('EC: ICT: T: 2C', 'traffic_mon'),
	('EC: I: T: 4A', 'transportation_mode_share'),
	('EC: I: T: 5A', 'travel_time_index'),
	('EC: I: UP: 2A', 'urban_development'),
	('SC: SH: SA: 8C', 'violent_crime_rate'),
	('SC: SH: SI: 4C', 'voter_participation'),
	('EC: I: WS: 4C', 'wastewater_collection'),
	('EN: EN: WS: 2C', 'water_consumption'),
	('EC: I: WS: 1C', 'water_supply'),
	('EC: ICT: WS: 2A', 'water_supply_ict_mon'),
	('EC: I: WS: 3C', 'water_supply_loss'),
	('EC: ICT: D: 1A', 'water_system_ict_mon'),
	('EC: ICT: ICT: 5C', 'wifi_public_areas'),
	('EC: ICT: ICT: 3C', 'wireless_broadband'),
	('EC: ICT: ICT: 4C', 'wireless_broadband_coverage'),
	('EC: P: EM: 2C', 'youth_unemployment_rate'),
	('EN: EN: WS: 3C', 'freshwater_consumption'),
])