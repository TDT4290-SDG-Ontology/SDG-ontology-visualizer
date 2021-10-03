import sys

import correlations

def generate_correlation_rdf(cc):
	def generate_statement(i, cc, index):
		from_target = correlations.correlations[i][0]
		to_target = correlations.correlations[i][1]
		factor = float(correlations.correlations[i][index - 1 + 2])

		# ignore empties
		if factor == 0.0:
			return ""

		return """
	<!-- http://www.semanticweb.org/aga/ontologies/2017/9/SDG#correlation.{cc}.{from_target}-{to_target} -->

    <owl:NamedIndividual rdf:about="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#correlation.{cc}.{from_target}-{to_target}">
        <rdf:type rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#SDGTargetCorrelation"/>
        <SDG:subgoalCorrelationFrom rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#{from_target}"/>
        <SDG:subgoalCorrelationFrom rdf:resource="http://metadata.un.org/sdg/{from_target}"/>
        <SDG:subgoalCorrelationTo rdf:resource="http://www.semanticweb.org/aga/ontologies/2017/9/SDG#{to_target}"/>
        <SDG:subgoalCorrelationTo rdf:resource="http://metadata.un.org/sdg/{to_target}"/>
        <SDG:subgoalCorrelationCountry rdf:datatype="http://www.w3.org/2001/XMLSchema#string">{cc}</SDG:subgoalCorrelationCountry>
        <SDG:subgoalCorrelationFactor rdf:datatype="http://www.w3.org/2001/XMLSchema#double">{factor}</SDG:subgoalCorrelationFactor>
        <SDG:isDummyData rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</SDG:isDummyData>
    </owl:NamedIndividual>
""".format(cc = cc, from_target = from_target, to_target = to_target, factor = factor)

	index = correlations.indices[cc]
	for i in range(len(correlations.correlations)):
		rdf = generate_statement(i, cc, index)
		if rdf != "":
			print(rdf)

if len(sys.argv) < 2:
	for k in correlations.indices.keys():
		generate_correlation_rdf(k)
else:	
	generate_correlation_rdf(sys.argv[1])
