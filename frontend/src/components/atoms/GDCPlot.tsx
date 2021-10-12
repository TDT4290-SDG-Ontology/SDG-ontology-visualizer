/* eslint-disable no-nested-ternary, no-plusplus, no-restricted-syntax */

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

type Prediction = {
  year: number;
  value: number;
  pred: number;
  best: number;
  worst: number;

  ci1: number[];
  ci2: number[];
  ci3: number[];
};

type PlotProps = {
  data: IndicatorScore;
  currentYear: number;
};

const GDCPlot: React.FC<PlotProps> = (props: PlotProps) => {
  const { data, currentYear } = props;

  const { currentCAGR } = data;

  const bestCAGR = data.yearlyGrowth[data.yearlyGrowth.length - 1].value;
  const worstCAGR = data.yearlyGrowth[0].value;

  const predictions: Prediction[] = [];

  // Initial dummy in order for all plots to start at the same ...

  for (const val of data.historicalData) {
    predictions.push({
      year: val.year,
      value: val.value,
      best: NaN,
      worst: NaN,
      pred: NaN,
      ci1: [ NaN, NaN ],
      ci2: [ NaN, NaN ],
      ci3: [ NaN, NaN ],
    });
  }

  const currentValue = predictions[predictions.length - 1].value;

  // Modify last point in predictions in order to have a common starting point...
  predictions[predictions.length - 1].pred = currentValue;
  predictions[predictions.length - 1].best = currentValue;
  predictions[predictions.length - 1].worst = currentValue;

  for (let year = currentYear + 1; year <= data.goal.deadline; year++) {
    const current = data.goal.baseline * (currentCAGR + 1.0) ** (year - data.goal.baselineYear);
    const best = data.goal.baseline * (bestCAGR + 1.0) ** (year - data.goal.baselineYear);
    const worst = data.goal.baseline * (worstCAGR + 1.0) ** (year - data.goal.baselineYear);

    predictions.push({
      year,
      pred: current,
      best,
      worst,
      value: NaN,
      ci1: [ NaN, NaN ],
      ci2: [ NaN, NaN ],
      ci3: [ NaN, NaN ],
    });
  }

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
        data={predictions}
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
        <Line type='monotone' dataKey='value' />
        <Line type='monotone' dataKey='pred' strokeDasharray='3 3' />
        <Line type='monotone' dataKey='best' strokeDasharray='3 3' />
        <Line type='monotone' dataKey='worst' strokeDasharray='3 3' />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GDCPlot;