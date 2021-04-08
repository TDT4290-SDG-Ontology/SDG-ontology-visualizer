import { Edge, GraphNode, Node, Prefix, SustainabilityGoal } from '../types/ontologyTypes';

export const mapPrefixNameToNode = (
  prefix: string,
  name: string,
  correlation?: number,
  type?: string,
): Node => ({
  prefix: {
    prefix,
    iri: `http://www.semanticweb.org/aga/ontologies/2017/9/${prefix}#`,
  },
  name,
  id: `http://www.semanticweb.org/aga/ontologies/2017/9/${prefix}#${name}`,
  correlation: correlation || -1,
  type: type || 'undefined',
});

export const parseNameFromClassId = (id: string): string => {
  const regex = /^[^_]*#/;
  const name = id.replace(regex, '');
  if (!name || name === id) return '';
  return name;
};

export const parsePrefixFromClassId = (id: string): Prefix | null => {
  const prefixRegex = /(?<=\/)([^/]*)(?=#)/;
  const prefixMatches = id.match(prefixRegex);
  if (!prefixMatches || !prefixMatches[0]) return null;

  const iriRegex = /^[^_]*#/;
  const iriMatches = id.match(iriRegex);
  if (!iriMatches || !iriMatches[0]) return null;

  return {
    prefix: prefixMatches[0],
    iri: iriMatches[0],
  };
};

export const mapIdToNode = (id: string, correlation?: number, type?: string): Node | null => {
  const prefix = parsePrefixFromClassId(id);
  const name = parseNameFromClassId(id);
  if (!prefix || !name) return null;
  return {
    prefix,
    name,
    id,
    correlation: correlation || -1,
    type: type || 'undefined',
  };
};

export const mapSustainabilityGoalToNode = (sdg: SustainabilityGoal): Node | null => {
  const node = mapIdToNode(sdg.instancesOf);
  if (!node) return null;
  node.name = sdg.label;
  return node;
};

export const mapIdToEdge = (id: string): Edge | null => {
  const prefix = parsePrefixFromClassId(id);
  const name = parseNameFromClassId(id);
  if (!prefix || !name) return null;
  return {
    prefix,
    name,
    id,
  };
};

export const mapCorrelationToName = (correlation: number) => {
  switch (correlation) {
    case 2:
      return 'høy';
    case 1:
      return 'medium';
    case 0:
      return 'lav';
    default:
      return '';
  }
};

export const mapCorrelationToColor = (correlation: number) => {
  switch (correlation) {
    case 2:
      return '.600';
    case 1:
      return '.500';
    case 0:
      return '.400';
    default:
      return '.300';
  }
};

// this is temporary until we get node type from query
export const isSubgoal = (node: GraphNode): boolean => {
  const { name } = node;
  if (name.length === 3) {
    if (name.charAt(1) !== '.') return false;
    if (Number.isNaN(parseInt(name.charAt(0), 10))) return false;
  } else if (name.length === 4) {
    if (name.charAt(2) !== '.') return false;
    if (Number.isNaN(parseInt(name.substring(0, 1), 10))) return false;
  } else {
    return false;
  }
  return true;
};
