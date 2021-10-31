import React, { PureComponent } from 'react';
import { Container, Text } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  LabelList,
  Tooltip,
  TooltipProps,
  Cell,
} from 'recharts';

import { IndicatorScore, GDCOutput } from '../../types/gdcTypes';

type HierarchyData = {
  name: string;
  value: number;
  key: string;
};

type KPIData = {
  name: string;
  value: number;
  key: string | string[];
  displayKey?: string;
  category: string;
};

// Note: the ordering here is important for the layout of the sunburst chart.
/* prettier-ignore */
const domainData: HierarchyData[] = [
  { name: 'Society',                                      value: 29, key: 'SC' },
  { name: 'Environment',                                  value: 28, key: 'EN' },
  { name: 'Economy',                                      value: 51, key: 'EC' },
];

/* prettier-ignore */
const categoryData: HierarchyData[] = [
  // Society
  { name: 'Food Security',                                value:  1, key: 'SC: FS' },
  { name: 'Safety',                                       value:  9, key: 'SC: SA' },
  { name: 'Social Inclusion',                             value:  5, key: 'SC: SI' },
  { name: 'Housing',                                      value:  2, key: 'SC: HO' },
  { name: 'Culture',                                      value:  2, key: 'SC: C' },
  { name: 'Health',                                       value:  6, key: 'SC: H' },
  { name: 'Education',                                    value:  4, key: 'SC: ED' },

  // Environment
  { name: 'Energy',                                       value:  4, key: 'EN: E' },
  { name: 'Public Space and Nature',                      value:  4, key: 'EN: PSN' },
  { name: 'Environmental Quality',                        value:  2, key: 'EN: EQ' },
  { name: 'Waste',                                        value:  6, key: 'EN: WA' },
  { name: 'Water and Sanitation',                         value:  6, key: 'EN: WS' },
  { name: 'Air Quality',                                  value:  6, key: 'EN: AQ' }, 
  
  // Economy 
  { name: 'Urban Planning',                               value:  2, key: 'EC: UP' }, 
  { name: 'Buildings',                                    value:  2, key: 'EC: B' }, 
  { name: 'Waste',                                        value:  1, key: 'EC: WA' }, 
  { name: 'Employment',                                   value:  4, key: 'EC: EM' }, 
  { name: 'Innovation',                                   value:  3, key: 'EC: IN' }, 
  { name: 'Public Service',                               value:  4, key: 'EC: PS' }, 
  { name: 'Transport',                                    value: 15, key: 'EC: T' },   
  { name: 'Electricity Supply',                           value:  6, key: 'EC: ES' },   
  { name: 'Drainage',                                     value:  1, key: 'EC: D' }, 
  { name: 'Water and Sanitation',                         value:  7, key: 'EC: WS' }, 
  { name: 'ICT',                                          value:  6, key: 'EC: ICT' }, 
];

/* prettier-ignore */
const kpiData: KPIData[] = [
  { name: 'Local Food Production',                        value: 1, key: 'SC: SH: FS: 1A',                category: 'SC: FS' },
  { name: 'Transportation Fatalities',                    value: 1, key: 'SC: SH: SA: 9C',                category: 'SC: SA' },
  { name: 'Violent Crime Rate',                           value: 1, key: 'SC: SH: SA: 8C',                category: 'SC: SA' },
  { name: 'Fire Service',                                 value: 1, key: 'SC: SH: SA: 7C',                category: 'SC: SA' },
  { name: 'Police Service',                               value: 1, key: 'SC: SH: SA: 6C',                category: 'SC: SA' },
  { name: 'Emergency Service Response Time',              value: 1, key: 'SC: SH: SA: 5A',                category: 'SC: SA' },
  { name: 'At Risk Population',                           value: 1, key: 'SC: SH: SA: 4A',                category: 'SC: SA' },
  { name: 'Resilience Plans',                             value: 1, key: 'SC: SH: SA: 3A',                category: 'SC: SA' },
  { name: 'Disaster Related Economic Losses',             value: 1, key: 'SC: SH: SA: 2C',                category: 'SC: SA' },
  { name: 'Natural Disaster Related Deaths',              value: 1, key: 'SC: SH: SA: 1C',                category: 'SC: SA' },
  { name: 'Child Care Availability',                      value: 1, key: 'SC: SH: SI: 5A',                category: 'SC: SI' },
  { name: 'Voter Participation',                          value: 1, key: 'SC: SH: SI: 4C',                category: 'SC: SI' },
  { name: 'Poverty',                                      value: 1, key: 'SC: SH: SI: 3C',                category: 'SC: SI' },
  { name: 'Gini Coefficient',                             value: 1, key: 'SC: SH: SI: 2C',                category: 'SC: SI' },
  { name: 'Gender Income Equity',                         value: 1, key: 'SC: SH: SI: 1C',                category: 'SC: SI' },
  { name: 'Housing Expenditure',                          value: 1, key: 'SC: SH: HO: 2A',                category: 'SC: HO' },
  { name: 'Informal Settlements',                         value: 1, key: 'SC: SH: HO: 1C',                category: 'SC: HO' },
  { name: 'Cultural Infrastructure',                      value: 1, key: 'SC: EH: C: 2A',                 category: 'SC: C' },
  { name: 'Cultural Expenditure',                         value: 1, key: 'SC: EH: C: 1C',                 category: 'SC: C' },
  { name: 'In-Patient Hospital Beds',                     value: 1, key: 'SC: EH: H: 4A',                 category: 'SC: H' },
  { name: 'Health Insurance Coverage',                    value: 1, key: 'SC: EH: H: 5A',                 category: 'SC: H' },
  { name: 'Doctors',                                      value: 1, key: 'SC: EH: H: 3C',                 category: 'SC: H' },
  { name: 'Maternal Mortality Rate',                      value: 1, key: 'SC: EH: H: 2C',                 category: 'SC: H' },
  { name: 'Life Expectancy',                              value: 1, key: 'SC: EH: H: 1C',                 category: 'SC: H' },
  { name: 'Electronic Health Records',                    value: 1, key: 'SC: EH: ED: 5A',                category: 'SC: H' },
  { name: 'Adult Literacy',                               value: 1, key: 'SC: EH: ED: 4C',                category: 'SC: ED' },
  { name: 'Higher Education Degrees',                     value: 1, key: 'SC: EH: ED: 3C',                category: 'SC: ED' },
  { name: 'School Enrollment',                            value: 1, key: 'SC: EH: ED: 2C',                category: 'SC: ED' },
  { name: 'Students ICT Access',                          value: 1, key: 'SC: EH: ED: 1C',                category: 'SC: ED' },

  // Environment
  { name: 'Public Building Energy Consumption',           value: 1, key: 'EN: E: E: 4A',                  category: 'EN: E' },
  { name: 'Resident Thermal Energy Consumption',          value: 1, key: 'EN: E: E: 3C',                  category: 'EN: E' },
  { name: 'Electricity Consumption',                      value: 1, key: 'EN: E: E: 2C',                  category: 'EN: E' },
  { name: 'Renewable Energy Consumption',                 value: 1, key: 'EN: E: E: 1C',                  category: 'EN: E' },
  { name: 'Recreational Facilities',                      value: 1, key: 'EN: EN: PSN: 4A',               category: 'EN: PSN' },
  { name: 'Protected Areas',                              value: 1, key: 'EN: EN: PSN: 3A',               category: 'EN: PSN' },
  { name: 'Green Area Accessibility',                     value: 1, key: 'EN: EN: PSN: 2A',               category: 'EN: PSN' },
  { name: 'Green Areas',                                  value: 1, key: 'EN: EN: PSN: 1C',               category: 'EN: PSN' },
  { name: 'Exposure to Noise',                            value: 1, key: 'EN: EN: EQ: 2A',                category: 'EN: EQ' },
  { name: 'EMF Exposure',                                 value: 1, key: 'EN: EN: EQ: 1C',                category: 'EN: EQ' },
  { name: 'Other',                                        value: 1, key: 'EN: EN: WA: 1C - other',        category: 'EN: WA' },
  { name: 'Recycled',                                     value: 1, key: 'EN: EN: WA: 1C - recycled',     category: 'EN: WA' },
  { name: 'Open Dump',                                    value: 1, key: 'EN: EN: WA: 1C - open_dump',    category: 'EN: WA' },
  { name: 'Incinerated',                                  value: 1, key: 'EN: EN: WA: 1C - incinerated',  category: 'EN: WA' },
  { name: 'Burnt',                                        value: 1, key: 'EN: EN: WA: 1C - burnt',        category: 'EN: WA' },
  { name: 'Landfill',                                     value: 1, key: 'EN: EN: WA: 1C - landfill',     category: 'EN: WA' },
  { name: 'Wastewater Treated: Tertiary',                 value: 1, key: 'EN: EN: WS: 4C - tertiary',     category: 'EN: WS' },
  { name: 'Wastewater Treated: Secondary',                value: 1, key: 'EN: EN: WS: 4C - secondary',    category: 'EN: WS' },
  { name: 'Wastewater Treated: Primary',                  value: 1, key: 'EN: EN: WS: 4C - primary',      category: 'EN: WS' },
  { name: 'Fresh Water Consumption',                      value: 1, key: 'EN: EN: WS: 3C',                category: 'EN: WS' },
  { name: 'Water Consumption',                            value: 1, key: 'EN: EN: WS: 2C',                category: 'EN: WS' },
  { name: 'Water Quality',                                value: 1, key: 'EN: EN: WS: 1C',                category: 'EN: WS' },
  { name: 'GHG Emissions',                                value: 1, key: 'EN: EN: AQ: 2C',                category: 'EN: AQ' },
  { name: 'Air Pollution O3',                             value: 1, key: 'EN: EN: AQ: 1C - o3',           category: 'EN: AQ' },
  { name: 'Air Pollution SO2',                            value: 1, key: 'EN: EN: AQ: 1C - so2',          category: 'EN: AQ' },
  { name: 'Air Pollution NO2',                            value: 1, key: 'EN: EN: AQ: 1C - no2',          category: 'EN: AQ' },
  { name: 'Air Pollution PM10',                           value: 1, key: 'EN: EN: AQ: 1C - pm_10',        category: 'EN: AQ' },
  { name: 'Air Pollution PM2.5',                          value: 1, key: 'EN: EN: AQ: 1C - pm_2.5',       category: 'EN: AQ' },

  // Economy
  { name: 'Urban Development and Spatial Planning',       value: 1, key: [
      'EC: I: UP: 2A - compact', 
      'EC: I: UP: 2A - connected', 
      'EC: I: UP: 2A - integrated', 
      'EC: I: UP: 2A - inclusive', 
      'EC: I: UP: 2A - resilient',
    ],
    category: 'EC: UP', displayKey: 'EC: I: UP: 2A' },
  { name: 'Pedestrian Infrastructure',                    value: 1, key: 'EC: I: UP: 1A',             category: 'EC: UP' },
  { name: 'Integrated Building Management Systems',       value: 1, key: 'EC: I: B: 2A',              category: 'EC: B' },
  { name: 'Public Building Sustainability',               value: 1, key: 'EC: I: B: 1A',              category: 'EC: B' },
  { name: 'Solid Waste Collection',                       value: 1, key: 'EC: I: WA: 1C',             category: 'EC: WA' },
  { name: 'ICT Industry Employment',                      value: 1, key: 'EC: P: EM: 4A',             category: 'EC: EM' },
  { name: 'Tourism Industry Employment',                  value: 1, key: 'EC: P: EM: 3A',             category: 'EC: EM' },
  { name: 'Youth Unemployment Rate',                      value: 1, key: 'EC: P: EM: 2C',             category: 'EC: EM' },
  { name: 'Unemployment Rate',                            value: 1, key: 'EC: P: EM: 1C',             category: 'EC: EM' },
  { name: 'Small and Medium-Sized Enterprises',           value: 1, key: 'EC: P: IN: 3A',             category: 'EC: IN' },
  { name: 'Patents',                                      value: 1, key: 'EC: P: IN: 2C',             category: 'EC: IN' },
  { name: 'R&D Expenditure',                              value: 1, key: 'EC: P: IN: 1C',             category: 'EC: IN' },
  { name: 'Public Sector e-Procurement',                  value: 1, key: 'EC: ICT: PS: 3A',           category: 'EC: PS' },
  { name: 'e-Government',                                 value: 1, key: 'EC: ICT: PS: 2A',           category: 'EC: PS' },
  { name: 'Open Data - Percent',                          value: 1, key: 'EC: ICT: PS: 1A - percent', category: 'EC: PS' },
  { name: 'Open Data - Number',                           value: 1, key: 'EC: ICT: PS: 1A - number',  category: 'EC: PS' },
  { name: 'Low-Carbon Emission Passenger Vehicles',       value: 1, key: 'EC: I: T: 8A',              category: 'EC: T' },
  { name: 'Shared Vehicles',                              value: 1, key: 'EC: I: T: 7A',              category: 'EC: T' },
  { name: 'Shared Bicycles',                              value: 1, key: 'EC: I: T: 6A',              category: 'EC: T' },
  { name: 'Travel Time Index',                            value: 1, key: 'EC: I: T: 5A',              category: 'EC: T' },
  { name: 'ParaTransport',                                value: 1, key: 'EC: I: T: 4A - para',       category: 'EC: T' },
  { name: 'Cycling',                                      value: 1, key: 'EC: I: T: 4A - cycling',    category: 'EC: T' },
  { name: 'Walking',                                      value: 1, key: 'EC: I: T: 4A - walking',    category: 'EC: T' },
  { name: 'Public Transport',                             value: 1, key: 'EC: I: T: 4A - public',     category: 'EC: T' },
  { name: 'Private Vehicles',                             value: 1, key: 'EC: I: T: 4A - private',    category: 'EC: T' },
  { name: 'Bicycle Network',                              value: 1, key: 'EC: I: T: 3C',              category: 'EC: T' },
  { name: 'Public Transit Network Convenience',           value: 1, key: 'EC: I: T: 2A',              category: 'EC: T' },
  { name: 'Public Transit Network',                       value: 1, key: 'EC: I: T: 1C',              category: 'EC: T' },
  { name: 'Intersection Control',                         value: 1, key: 'EC: ICT: T: 3A',            category: 'EC: T' },
  { name: 'Traffic Monitoring',                           value: 1, key: 'EC: ICT: T: 2C',            category: 'EC: T' },
  { name: 'Dynamic Public Transport Information',         value: 1, key: 'EC: ICT: T: 1C',            category: 'EC: T' },
  { name: 'Access to Electricity',                        value: 1, key: 'EC: I: ES: 3C',             category: 'EC: ES' },
  { name: 'Electricity System Outage Time',               value: 1, key: 'EC: I: ES: 2C',             category: 'EC: ES' },
  { name: 'Electricity System Outage Frequency',          value: 1, key: 'EC: I: ES: 1C',             category: 'EC: ES' },
  { name: 'Demand Response Penetration',                  value: 1, key: 'EC: ICT: ES: 3A',           category: 'EC: ES' },
  { name: 'Electricity Supply ICT Monitoring',            value: 1, key: 'EC: ICT: ES: 2A',           category: 'EC: ES' },
  { name: 'Smart Electricity Meters',                     value: 1, key: 'EC: ICT: ES: 1C',           category: 'EC: ES' },
  { name: 'Drainage / Storm Water System ICT Monitoring', value: 1, key: 'EC: ICT: D: 1A',            category: 'EC: D' },
  { name: 'Household Sanitation',                         value: 1, key: 'EC: I: WS: 5C',             category: 'EC: WS' },
  { name: 'Wastewater collection',                        value: 1, key: 'EC: I: WS: 4C',             category: 'EC: WS' },
  { name: 'Water Supply Loss',                            value: 1, key: 'EC: I: WS: 3C',             category: 'EC: WS' },
  { name: 'Potable Water Supply',                         value: 1, key: 'EC: I: WS: 2C',             category: 'EC: WS' },
  { name: 'Basic Water Supply',                           value: 1, key: 'EC: I: WS: 1C',             category: 'EC: WS' },
  { name: 'Water Supply ICT Monitoring',                  value: 1, key: 'EC: ICT: WS: 2A',           category: 'EC: WS' },
  { name: 'Smart Water Meters',                           value: 1, key: 'EC: ICT: WS: 1C',           category: 'EC: WS' },
  { name: 'Availability of WIFI in Public Areas',         value: 1, key: 'EC: ICT: ICT: 5C',          category: 'EC: ICT' },
  { name: 'Wireless Broadband Coverage - 4G',             value: 1, key: 'EC: ICT: ICT: 4C - 4g',     category: 'EC: ICT' },
  { name: 'Wireless Broadband Coverage - 3G',             value: 1, key: 'EC: ICT: ICT: 4C - 3g',     category: 'EC: ICT' },
  { name: 'Wireless Broadband Subscriptions',             value: 1, key: 'EC: ICT: ICT: 3C',          category: 'EC: ICT' },
  { name: 'Fixed Broadband Subscriptions',                value: 1, key: 'EC: ICT: ICT: 2C',          category: 'EC: ICT' },
  { name: 'Household Internet Access',                    value: 1, key: 'EC: ICT: ICT: 1C',          category: 'EC: ICT' },
];

const sgn = (v: number) => (v >= 0.0 ? 1.0 : -1.0);

const DEG2RAD = Math.PI / 180.0;
const toCartesian = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + radius * Math.cos(-DEG2RAD * angle),
  y: cy + radius * Math.sin(-DEG2RAD * angle),
});

const deltaAngle = (start: number, end: number) =>
  sgn(end - start) * Math.min(Math.abs(end - start), 360);

let idCounter = 0;
const uniqueId = (prefix?: string) => {
  const counter = idCounter;
  idCounter += 1;
  return `${prefix}${counter}`;
};

type SunburstProps = {
  gdc: GDCOutput;
  municipality: string;
  showLegend?: boolean;
};

const sunburstDefaults = {
  showLegend: false,
};

type CategoryScore = {
  score: number;
  count: number;
  unreported: number;
  withoutGoal: number;
};

const COLORS = ['#8a817a', '#4ba0be', '#dd7947', '#ddac42', '#5ab47d', '#009e69'];

type ValueType = number | string | Array<number | string>;
type NameType = number | string;

type CustomTooltipProps<TValue extends ValueType, TName extends NameType> = TooltipProps<
  TValue,
  TName
> & {
  gdc: GDCOutput;
  indicatorScores: Map<string, number>;
  categoryScores: Map<string, CategoryScore>;
};

class CustomTooltip<TValue extends ValueType, TName extends NameType> extends PureComponent<
  CustomTooltipProps<TValue, TName>
> {
  render() {
    const { active, payload, gdc, indicatorScores, categoryScores } = this.props;

    if (active && payload && payload.length) {
      const obj = payload[0].payload;
      if (!obj) return null;

      const { key, name } = obj;

      let score: number;
      if (obj.category !== undefined) {
        // KPI

        const indi = indicatorScores.get(Array.isArray(key) ? obj.displayKey : key);
        if (!indi) return null;

        score = indi;
      } else if (key.indexOf(':') > -1) {
        // category
        const cat = categoryScores.get(key);
        if (!cat) return null;

        score = cat.score;
      } else {
        // domain
        const dom = gdc.domains.get(key);
        if (!dom) return null;

        score = dom.score;
      }

      let text: number | string = '';
      if (score >= 0.0) text = score.toFixed(2);
      else if (score === -2) text = 'Unreported';
      else if (score === -1) text = 'Missing goal';

      return (
        <Container bg="white" borderWidth="1px" borderRadius="0.5em" p="0.5em">
          <Text>{`${name}: ${text}`}</Text>
        </Container>
      );
    }

    return null;
  }
}

const DomainLabels = (arg: any) => {
  const { viewBox, offset, className, name } = arg;
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, clockWise } = viewBox;

  const radius = (innerRadius + outerRadius) / 2;
  const angle = deltaAngle(startAngle, endAngle);
  const sign = sgn(angle);

  const labelAngle = startAngle + sign * offset;
  const direction = angle <= 0 ? clockWise : !clockWise;

  const start = toCartesian(cx, cy, radius, labelAngle);
  const end = toCartesian(cx, cy, radius, labelAngle + (direction ? 1 : -1) * 359);
  const path = `M${start.x},${start.y}
                A${radius},${radius},0,1,${direction ? 0 : 1},${end.x},${end.y}`;

  const id = uniqueId('recharts-radial-line-');
  return (
    <text
      dominantBaseline="central"
      className={`recharts-radial-bar-label ${className}`}
      fill="white"
      textAnchor="middle"
    >
      <defs>
        <path id={id} d={path} />
      </defs>
      <textPath xlinkHref={`#${id}`} startOffset="10%">
        {name}
      </textPath>
    </text>
  );
};
const CategoryLabels = (arg: any) => {
  const { viewBox, className, name } = arg;
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = viewBox;

  let angle = (startAngle + endAngle) / 2;
  if (angle === 270) angle -= 0.1;

  let start = toCartesian(cx, cy, outerRadius - 10, angle);
  let end = toCartesian(cx, cy, innerRadius + 5, angle);

  const needsSwap = angle < 90 || angle > 270;
  if (needsSwap) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  const path = `M${start.x},${start.y}
                L${end.x},${end.y}`;

  const id = uniqueId('recharts-radial-line-');
  return (
    <text
      dominantBaseline="central"
      className={`recharts-radial-bar-label ${className}`}
      fill="white"
      textRendering="optimizeLegibility"
      textAnchor={`${needsSwap ? 'end' : 'start'}`}
      fontSize="1em"
    >
      <defs>
        <path id={id} d={path} />
      </defs>
      <textPath xlinkHref={`#${id}`} startOffset={`${needsSwap ? 100 : 0}%`}>
        {name}
      </textPath>
    </text>
  );
};

const GDCSunburst: React.FC<SunburstProps> = (props: SunburstProps) => {
  const { gdc, municipality, showLegend } = props;

  const indicatorScores = new Map<string, number>();
  const categoryScores = new Map<string, CategoryScore>();

  const getScore = (kpi: string) => {
    const score = gdc.indicators.get(kpi);
    if (score) return (score as IndicatorScore).points;

    if (gdc.indicatorsWithoutGoals.has(kpi)) return -1;

    // unreported
    return -2;
  };

  if (gdc) {
    categoryData.forEach((category) => {
      categoryScores.set(category.key, { score: 0, count: 0, unreported: 0, withoutGoal: 0 });
    });

    kpiData.forEach((kpi) => {
      if (!kpi) {
        return;
      }

      if (Array.isArray(kpi.key)) {
        if (!kpi.displayKey) return;

        let sum = 0.0;
        let count = 0;
        let unreported = 0;
        let withoutGoal = 0;

        kpi.key.forEach((ind) => {
          const score = getScore(ind);
          if (score === -1) {
            withoutGoal += 1;
          } else if (score === -2) {
            unreported += 1;
          } else if (score >= 0.0) {
            sum += score;
            count += 1;
          }
        });

        let score: number;
        if (count > 0) {
          score = sum / count;
        } else if (unreported > withoutGoal) {
          score = -2;
        } else {
          score = -1;
        }

        indicatorScores.set(kpi.displayKey, score);
        const cat = categoryScores.get(kpi.category);
        if (!cat) {
          return;
        }

        if (score > 0) {
          cat.score += score;
          cat.count += 1;
        } else if (score === -2) {
          cat.unreported += 1;
        } else if (score === -1) {
          cat.withoutGoal += 1;
        }

        categoryScores.set(kpi.category, cat);
      } else {
        const score = getScore(kpi.key as string);
        indicatorScores.set(kpi.key as string, score);

        const cat = categoryScores.get(kpi.category);
        if (!cat) {
          return;
        }

        if (score > 0) {
          cat.score += score;
          cat.count += 1;
        } else if (score === -2) {
          cat.unreported += 1;
        } else if (score === -1) {
          cat.withoutGoal += 1;
        }

        categoryScores.set(kpi.category, cat);
      }
    });

    // We're assigning to a property of the iterator, so we need for-of.
    /* eslint-disable-next-line no-restricted-syntax */
    for (const catScore of categoryScores.values()) {
      if (catScore.count > 0) catScore.score /= catScore.count;
    }
  }

  const START_DOMAINS = 50;
  const START_CATEGORIES = 100;
  const START_KPIS = 300;

  let legend = null;
  if (showLegend)
    legend = (
      <g>
        <g>
          <circle cx="10" cy="83%" r="7.5" fill={COLORS[5]} />
          <text x="25" y="82.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            95% +
          </text>
        </g>
        <g>
          <circle cx="10" cy="86%" r="7.5" fill={COLORS[4]} />
          <text x="25" y="85.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            66% - 95%
          </text>
        </g>
        <g>
          <circle cx="10" cy="89%" r="7.5" fill={COLORS[3]} />
          <text x="25" y="88.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            33% - 66%
          </text>
        </g>
        <g>
          <circle cx="10" cy="92%" r="7.5" fill={COLORS[2]} />
          <text x="25" y="91.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            {'<33%'}
          </text>
        </g>
        <g>
          <circle cx="10" cy="95%" r="7.5" fill={COLORS[1]} />
          <text x="25" y="94.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            Missing goal
          </text>
        </g>
        <g>
          <circle cx="10" cy="98%" r="7.5" fill={COLORS[0]} />
          <text x="25" y="97.75%" dominantBaseline="central" textRendering="optimizeLegibility">
            Unreported data
          </text>
        </g>
      </g>
    );

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth="650px" minHeight="800px">
      <PieChart width={800} height={800}>
        <Pie
          cy="45%"
          data={domainData}
          dataKey="value"
          innerRadius={START_DOMAINS}
          outerRadius={START_CATEGORIES - 1}
          startAngle={90}
          endAngle={450}
          isAnimationActive={false}
        >
          {domainData.map((entry) => {
            const score = gdc.domains.get(entry.key);
            const colorIndex: number = !score ? 0 : Math.floor(score.score) + 1;
            return <Cell key={entry.key} fill={COLORS[colorIndex]} />;
          })}
          <LabelList dataKey="name" content={<DomainLabels />} />
        </Pie>
        <Pie
          cy="45%"
          data={categoryData}
          dataKey="value"
          innerRadius={START_CATEGORIES}
          outerRadius={START_KPIS - 1}
          startAngle={90}
          endAngle={450}
          isAnimationActive={false}
        >
          {categoryData.map((entry) => {
            const score = categoryScores.get(entry.key);
            let colorIndex: number;
            if (!score) colorIndex = 0;
            else if (score.score < 0) colorIndex = score.score + 2;
            else colorIndex = Math.floor(score.score) + 1;
            return <Cell key={entry.key} fill={COLORS[colorIndex]} />;
          })}
          <LabelList dataKey="name" content={<CategoryLabels />} />
        </Pie>
        <Pie
          cy="45%"
          data={kpiData}
          dataKey="value"
          innerRadius={START_KPIS}
          outerRadius={START_KPIS + 25}
          startAngle={90}
          endAngle={450}
        >
          {kpiData.map((entry) => {
            const key: string = Array.isArray(entry.key)
              ? entry.displayKey!
              : (entry.key as string);
            const score = indicatorScores.get(key as string);
            let colorIndex: number;
            if (!score) colorIndex = 0;
            else if (score < 0) colorIndex = score + 2;
            else colorIndex = Math.floor(score) + 1;
            return <Cell key={key} fill={COLORS[colorIndex]} />;
          })}
        </Pie>
        <Tooltip
          content={(
            <CustomTooltip
              gdc={gdc}
              indicatorScores={indicatorScores}
              categoryScores={categoryScores}
            />
          )}
        />
        <g>
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="central"
            textRendering="optimizeLegibility"
          >
            {municipality}
          </text>
        </g>
        {legend}
      </PieChart>
    </ResponsiveContainer>
  );
};

GDCSunburst.defaultProps = sunburstDefaults;
export default GDCSunburst;
