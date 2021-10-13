import React, { useEffect } from 'react';
import {
  PieChart, Pie,
  ResponsiveContainer,
} from 'recharts';
import { getGDCOutput } from '../../api/gdc';

const data01 = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];
const data02 = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
  { name: 'B4', value: 30 },
  { name: 'B5', value: 50 },
  { name: 'C1', value: 100 },
  { name: 'C2', value: 200 },
  { name: 'D1', value: 150 },
  { name: 'D2', value: 50 },
];

type ChartProps = {
  year: number;
  code: string;
};

const GDCMinicipalityChart:  React.FC<ChartProps> = (props: ChartProps) => {
  const { year, code } = props;
  console.log(year);
  console.log(code);

  const FindScores = async (municipalityCode: string, selectedYear: number) => {
    const data = await getGDCOutput(municipalityCode, selectedYear);
    console.log('DATA');
    console.log(data);
  };

  useEffect(() => {
    FindScores(code, year); 
  },
      []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={400} height={400}>
        <Pie data={data01} dataKey="value" cx="50%" cy="50%" outerRadius={60} fill="#d33458" />
        <Pie data={data01} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#f4d03f" />
        <Pie data={data01} dataKey="value" cx="50%" cy="50%" innerRadius={100} outerRadius={130} fill="#8884d8" />
        <Pie data={data02} dataKey="value" cx="50%" cy="50%" innerRadius={130} outerRadius={150} fill="#829a9d" label />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GDCMinicipalityChart;