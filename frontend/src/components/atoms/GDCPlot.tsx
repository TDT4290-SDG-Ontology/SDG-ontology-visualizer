import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  // Area,
  Line,
  // Scatter,
} from 'recharts';

import { IndicatorScore } from '../../types/gdcTypes';

/*
type Datapoints = {
  year: number;
  ci1: number[];
  ci2: number[];
  prediction: number;
  actualValue: number;
};
*/

type PlotProps = {
  data: IndicatorScore;
};

const GDCPlot: React.FC<PlotProps> = (props: PlotProps) => {
  const { data } = props;

  return (
    <ResponsiveContainer
      width='100%'
      height='100%'
      minWidth={800}
      minHeight={600}
    >
      <ComposedChart
        width={800}
        height={400}
        data={data.historicalData}
        margin={{
          top: 20,
          bottom: 20,
          right: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis dataKey='year' />
        <YAxis />
        <Line type='monotone' dataKey='prediction' />
        <Line data={data.historicalData} type='monotone' dataKey='value' />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GDCPlot;