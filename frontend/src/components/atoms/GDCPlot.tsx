/* eslint-disable no-nested-ternary, no-plusplus, no-restricted-syntax */

import React from 'react';
import { Heading, Stack, Container, Table, Tr, Td, Tbody } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Line,
  Tooltip,
  Legend,
} from 'recharts';

import { IndicatorScore } from '../../types/gdcTypes';

type Prediction = {
  year: number;
  value: number;

  predicted: number;
  required: number;
  bounds: number[];
};

type PlotProps = {
  data: IndicatorScore;
  // compareData?: IndicatorScore;
  currentYear: number;
};

const GDCPlot: React.FC<PlotProps> = (props: PlotProps) => {
  const { data, currentYear } = props;

  const getPlotData = (score: IndicatorScore): Prediction[] => {
    const { currentCAGR, requiredCAGR } = score;

    const bestCAGR = score.yearlyGrowth[data.yearlyGrowth.length - 1].value;
    const worstCAGR = score.yearlyGrowth[0].value;

    const predictions: Prediction[] = [];

    // Initial dummy in order for all plots to start at the same ...
    for (const val of score.historicalData) {
      predictions.push({
        year: val.year,
        value: val.value,
        bounds: [ NaN, NaN ],
        predicted: NaN,
        required: NaN,
      });
    }

    const currentValue = predictions[predictions.length - 1].value;

    // Modify last point in predictions in order to have a common starting point...
    predictions[predictions.length - 1].predicted = currentValue;
    predictions[predictions.length - 1].bounds = [ currentValue, currentValue ];
    predictions[predictions.length - 1].required = currentValue;

    const { deadline } = score.goal;

    for (let year = currentYear + 1; year <= deadline; year++) {
      const prediction = currentValue * (currentCAGR + 1.0) ** (year - currentYear);
      const best = currentValue * (bestCAGR + 1.0) ** (year - currentYear);
      const worst = currentValue * (worstCAGR + 1.0) ** (year - currentYear);
      const required = currentValue * (requiredCAGR + 1.0) ** (year - currentYear);

      predictions.push({
        year,
        predicted: prediction,
        bounds: [best, worst],
        required,
        value: NaN,
      });
    }

    return predictions;
  };

  const predictions = getPlotData(data);

  const CustomTooltip: React.FC = (arg: any) => {
    const { active, payload, label } = arg;
    if (active && payload && payload.length) {
      const { year, value, required, predicted, bounds } = payload[0].payload;
      const [ best, worst ] = bounds;

      let predictedRow = null;
      let requiredRow = null;
      let bestRow = null;
      let worstRow = null;

      const rowify = (rowLabel: string, rowVal: number) => {
        if (!Number.isNaN(rowVal)) {
          return (
            <Tr>
              <Td p='0.5em'>{rowLabel}</Td>
              <Td p='0.5em' isNumeric>{rowVal.toFixed(2)}</Td>
            </Tr>
          );
        }

        return null;
      };

      const valueRow = rowify('Value', value);
      if (year !== currentYear) {
        predictedRow = rowify('Predicted', predicted);
        requiredRow = rowify('Required', required);
        bestRow = rowify('Best case', best);
        worstRow = rowify('Worst case', worst);
      }

      return (
        <Container
          bg='white'
          borderWidth='1px'
          borderRadius='0.5em'
          p='0.5em'
        >
          <Stack>
            <Heading p='0.5em' size='md'>{label}</Heading>
            <Table variant='simple'>
              <Tbody p='0px'>                              
                {valueRow}
                {predictedRow}
                {requiredRow}
                {bestRow}
                {worstRow}
              </Tbody>
            </Table>
          </Stack>
        </Container>
      );
    }

    return null;
  };

  // Default blue colour: curious blue
  // "suitable" complement: crimson
  return (
    <ResponsiveContainer
      width='100%'
      height='100%'
      minWidth={800}
      minHeight={500}
    >
      <ComposedChart
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area name='Bounds' type='natural' dataKey='bounds' fillOpacity='0.15' stroke='none' />
        <Line name='Existing values' type='natural' dataKey='value' />
        <Line name='Predicted values' type='natural' dataKey='predicted' strokeDasharray='3 3' />
        <Line name='Values required to reach target' type='natural' dataKey='required' stroke='gray' strokeDasharray='3 3' />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GDCPlot;