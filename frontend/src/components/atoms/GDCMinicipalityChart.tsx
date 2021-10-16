import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts';
import { getGDCOutput } from '../../api/gdc';
import { GDCOutput } from '../../types/gdcTypes';

type ChartProps = {
  year: number;
  code: string;
};

const indCOLORS = ['#D2B4DE', '#A569BD', '#7D3C98', '#4A235A'];
const catCOLORS = ['#85C1E9', '#5DADE2', '#2874A6', '#154360'];
const domCOLORS = ['#A3E4D7', '#48C9B0', '#16A085', '#0E6655'];

const GDCMinicipalityChart: React.FC<ChartProps> = (props: ChartProps) => {
  const [gdcInfo, setGDCInfo] = useState<GDCOutput>();
  const [domSum, setdomSum] = useState<any[]>();
  const [catSum, setcatSum] = useState<any[]>();
  const [sortedIndicators, setSortedIndicators] = useState<any[]>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortedIndicatorsKeys, setSortedIndicatorsKeys] = useState<any[]>();
  const { year, code } = props;
  console.log(year);
  console.log(code);

  const RADIAN = Math.PI / 180;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    console.log(22);

    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
        {index}
      </text>
    );
  };

  const fillCategories = () => {
    if (gdcInfo === undefined){
      return;
    }
    const categoriesArr = Array(Array.from(gdcInfo.domains.values()).length).fill([]);
    const categoryScoreSum = Array(Array.from(gdcInfo.domains.values()).length).fill(0);
    const domainWithSumScore = Array(Array.from(gdcInfo.domains.values()).length).fill(0);
    gdcInfo.categories.forEach((value, key) => {
      const splited = key.split(':', 1);
      let i = 0;
      gdcInfo.domains.forEach((dom_value, dom_key) => {
        if (dom_key === splited[0].replace(' ', '')){
          if (categoriesArr[i].length === 0){
            categoriesArr[i] = [];
          }
          categoriesArr[i].push({ key, value:value.score });
          categoryScoreSum[i] += value.score;
          return;
        }
        i += 1;
      });
    });
    categoryScoreSum.forEach((value, i) => {
      domainWithSumScore[i] = { key: Array.from(gdcInfo.domains.keys())[i], sumScore: value };
    });
    domainWithSumScore.sort((a, b) => {
      if (a.key < b.key) { return -1; }
      if (a.key > b.key) { return 1; }
      return 0;
    });
    setdomSum(domainWithSumScore);
  };

  const fillIndicators = () => {
    if (gdcInfo === undefined){
      return;
    }
    const indicatorsArr = Array(Array.from(gdcInfo.categories.values()).length).fill([]);
    const indicatorsScoreSum = Array(Array.from(gdcInfo.categories.values()).length).fill(0);
    const categoriesWithSumScore = Array(Array.from(gdcInfo.categories.values()).length).fill(0);
    gdcInfo.indicators.forEach((value, key) => {
      const splited = key.split(':', 3);
      let i = 0;
      gdcInfo.categories.forEach((cat_value, cat_key) => {
        if (cat_key.replace(' ', '') === splited.join(':').replace(' ', '')){
          if (indicatorsArr[i].length === 0){
            indicatorsArr[i] = [];
          }
          indicatorsArr[i].push({ key, value:value.score });
          indicatorsScoreSum[i] += value.score;
          return;
        }
        i += 1;
      });
    });
    indicatorsScoreSum.forEach((value, i) => {
      categoriesWithSumScore[i] = { key: Array.from(gdcInfo.categories.keys())[i], sumScore: value };
    });

    categoriesWithSumScore.sort((a, b) => {
      if (a.key < b.key) { return -1; }
      if (a.key > b.key) { return 1; }
      return 0;
    });
    setcatSum(categoriesWithSumScore);
    setSortedIndicators(Array.from(gdcInfo.indicators.values()).sort((a, b) => {
      if (a.kpi < b.kpi) { return -1; }
      if (a.kpi > b.kpi) { return 1; }
      return 0;
    }));
    setSortedIndicatorsKeys(Array.from(gdcInfo.indicators.keys()).sort((a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    }));
  };
  const FindScores = async (municipalityCode: string) => {
    const data = await getGDCOutput(municipalityCode, 2020);
    setGDCInfo(data);
  };

  useEffect(() => {
    FindScores(code);
    fillCategories();
    fillIndicators();
  },
      []);
  if (gdcInfo === undefined || sortedIndicators === undefined || domSum === undefined || catSum === undefined ){
    return (
      <></>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={400} maxHeight={450} minWidth={900}>
      <PieChart width={300} height={300}>
        <Pie data={[]} dataKey="score" cx="50%" cy="50%" startAngle={0} outerRadius={40} fill="#d33458" />
        <Pie data={domSum} nameKey="key" dataKey="sumScore" cx="50%" cy="50%" startAngle={0} innerRadius={40} outerRadius={80} fill="#d33458">
          {domSum.map((entry, dom_index) => (
              // eslint-disable-next-line react/no-array-index-key
            <Cell key={`cell-${dom_index}`} fill={domCOLORS[Math.trunc(entry.sumScore / 20)]} />
          ))}
        </Pie>
        <Pie
          data={catSum}
          nameKey="key"
          dataKey="sumScore"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={130}
        >
          <Label
            value={gdcInfo.municipality}
            position="center"
            fontSize='16px'
          />
          {catSum.map((entry, cat_index) => (
              // eslint-disable-next-line react/no-array-index-key
            <Cell key={`cell-${cat_index}`} fill={catCOLORS[Math.trunc(entry.sumScore / 200)]} />
          ))}
        </Pie>
        <Pie
          data={sortedIndicators}
          dataKey="score"
          cx="50%"
          cy="50%"
          startAngle={0}
          innerRadius={130}
          outerRadius={170}
          labelLine
          label
        >
          {sortedIndicators.map((entry, ind_index) => (
              // eslint-disable-next-line react/no-array-index-key
            <Cell key={`cell-${ind_index}`} fill={indCOLORS[Math.trunc(entry.score / 30) - 1]} />
            ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GDCMinicipalityChart;