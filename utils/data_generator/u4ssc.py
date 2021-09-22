import random

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
	pct("EC: ICT: ES: 1A",  	"Smart electricity meters"),
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
	pct("EC: P: EM: 3C",		"Tourism industry employment"),
	pct("EC: P: EM: 4C",		"ICT sector employment"),
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
	avg("EN: EN: EQ: 2C",		"Greenhouse gas emissions", "Greenhouse gas (GHG) emissions per capita (Tonnes eCO2 / capita)"),
	pct("EN: EN: WS: 1C",		"Drinking water quality", "Percentage of households covered by an audited Water Safety Plan"),
	avg("EN: EN: WS: 2C",		"Water consumption", "Total water consumption per capita"),
	pct("EN: EN: WS: 3C",		"Fresh water consumption", "Percentage of water consumed from freshwater sources"),
	pct("EN: EN: WS: 3C?",		"Wastewater treatment", "Percentage of wastewater receiving treatment (Primary, Secondary, Tertiary)", datasets=["primary", "secondary", "tertiary"]),
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
	pct("SC: SH: SA: 2C",		"Disaster-related economic losses", "Economic losses (related to natural disasters) as a percentage of the city’s gross domestic product (GDP)"),
	yes_no("SC: SH: SA: 3A", 	"Resilience plans", "This involves implementation of risk and vulnerability assessments, financial (capital and operating) plans and technical systems for disaster mitigation addressing natural and human induced disasters and hazards"),
	pct("SC: SH: SA: 4A",		"Population living in disaster prone areas"),
	abs("SC: SH: SA: 5C", 		"Emergency service response time"),
	rel("SC: SH: SA: 6C", 		"Police service", "Number of police officers per 100,000 inhabitants"),
	rel("SC: SH: SA: 7C",		"Fire service", "Number of firefighters per 100,000 inhabitants"),
	rel("SC: SH: SA: 8C", 		"Violent crime rate"),
	rel("SC: SH: SA: 9C",		"Traffic fatailities"),
	pct("SC: SH: FS: 1C",		"Local food production", "Percentage of local food supplied from within 100 km of the urban area"),


]
