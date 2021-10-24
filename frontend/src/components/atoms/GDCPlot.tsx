import React, { PureComponent } from 'react';
import { Heading, Stack, Container, Table, Tr, Td, Th, Thead, Tbody, Text } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Line,
  Tooltip,
  TooltipProps,
  Legend,
} from 'recharts';

import { IndicatorScore, IndicatorWithoutGoal } from '../../types/gdcTypes';

type Prediction = {
  year: number;
  value: number;

  predicted: number;
  required: number;
  bounds: number[];
  target: number;

  compareValue: number;
  compareBounds: number[];
  comparePredicted: number;
  compareRequired: number;
  compareTarget: number;
};

type PlotProps = {
  currentYear: number;

  municipality: string;
  data: IndicatorScore | IndicatorWithoutGoal;

  compareData?: IndicatorScore | IndicatorWithoutGoal;
  compareMunicipality?: string;
};

const defaultProps = {
  compareData: undefined,
  compareMunicipality: undefined,
};

type ValueType = number | string | Array<number | string>;
type NameType = number | string;

type CustomLegendProps = any & {
  municipality: string;
  compareMunicipality?: string;
};

const customLegendDefaults = {
  compareMunicipality: undefined,
};

const CustomLegend: React.FC<CustomLegendProps> = (arg: CustomLegendProps) => {
  // Slightly customized version of the default recharts legend component...

  const { municipality, compareMunicipality, payload } = arg;

  const SIZE = 32;
  const renderIcon = (color: string) => {
    const halfSize = SIZE / 2;
    const sixthSize = SIZE / 6;
    const thirdSize = SIZE / 3;

    return (
      <path
        strokeWidth={4}
        fill="none"
        stroke={color}
        d={`M0,${halfSize}h${thirdSize}
          A${sixthSize},${sixthSize},0,1,1,${2 * thirdSize},${halfSize}
          H${SIZE}M${2 * thirdSize},${halfSize}
          A${sixthSize},${sixthSize},0,1,1,${thirdSize},${halfSize}`}
        className="recharts-legend-icon"
      />
    );
  };

  const renderItems = (muni: string, items: any[]) => (
    <li
      key={`${muni}`}
      className="recharts-legend-item legend-item-0"
      style={{ display: 'block', marginRight: 10 }}
    >
      <Text style={{ display: 'inline-block', marginRight: 4 }}>{`${muni}:`}</Text>
      <ul
        className="recharts-default-legend"
        style={{ padding: 0, margin: 0, textAlign: 'center', display: 'inline-block' }}
      >
        {items.map((entry, i) => (
          <li
            className={`recharts-legend-item legend-item-${i}`}
            style={{ display: 'inline-block', marginRight: 10 }}
            key={`legend-item-${entry.value}`}
          >
            <svg
              width={14}
              height={14}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}
              version="1.1"
            >
              {renderIcon(entry.color)}
            </svg>
            <span className="recharts-legend-item-text" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </li>
  );

  const items: any[] = [];
  const compItems: any[] = [];

  payload.forEach((its: any) => {
    if (its.dataKey.startsWith('compare')) {
      compItems.push(its);
    } else {
      items.push(its);
    }
  });

  return (
    <ul className="recharts-default-legend" style={{ padding: 0, margin: 0, textAlign: 'center' }}>
      {renderItems(municipality, items)}
      {compareMunicipality && renderItems(compareMunicipality, compItems)}
    </ul>
  );
};

CustomLegend.defaultProps = customLegendDefaults;

type CustomTooltipProps<TValue extends ValueType, TName extends NameType> = TooltipProps<
  TValue,
  TName
> & {
  currentYear: number;

  municipality: string;

  compareData?: IndicatorScore | IndicatorWithoutGoal;
  compareMunicipality?: string;
};

class CustomTooltip<TValue extends ValueType, TName extends NameType> extends PureComponent<
  CustomTooltipProps<TValue, TName>
> {
  // We have to use static default properties, as this must be a class component...
  // However, eslint complains about this, so we silence eslint.
  /* eslint-disable-next-line react/static-property-placement */
  static defaultProps = {
    compareData: undefined,
    compareMunicipality: undefined,
  };

  render() {
    const { active, payload, label, currentYear, municipality, compareData, compareMunicipality } =
      this.props;
    if (active && payload && payload.length) {
      const {
        year,
        value,
        required,
        predicted,
        bounds,
        target,
        compareValue,
        comparePredicted,
        compareRequired,
        compareBounds,
        compareTarget,
      } = payload[0].payload;
      const [best, worst] = bounds;
      const [compareBest, compareWorst] = compareBounds;

      let predictedRow = null;
      let requiredRow = null;
      let bestRow = null;
      let worstRow = null;
      let targetRow = null;

      const rowify = (rowLabel: string, rowVal: number, compVal: number) => {
        let compRow = null;
        if (compareData !== undefined) {
          if (compVal !== undefined && !Number.isNaN(compVal)) {
            const val = typeof compVal === 'number' ? compVal.toFixed(2) : compVal;
            compRow = <Td p="0.5em" isNumeric>{`${val}`}</Td>;
          } else {
            compRow = <Td p="0.5em" isNumeric />;
          }
        }

        if (rowVal !== undefined && !Number.isNaN(rowVal)) {
          const val = typeof rowVal === 'number' ? rowVal.toFixed(2) : rowVal;
          return (
            <Tr>
              <Td p="0.5em">{`${rowLabel}:`}</Td>
              <Td p="0.5em" isNumeric>{`${val}`}</Td>
              {compRow}
            </Tr>
          );
        }

        if (compVal !== undefined && !Number.isNaN(compVal)) {
          return (
            <Tr>
              <Td p="0.5em">{`${rowLabel}:`}</Td>
              <Td p="0.5em" isNumeric />
              {compRow}
            </Tr>
          );
        }

        return null;
      };

      const valueRow = rowify('Value', value, compareValue);
      if (year !== currentYear) {
        predictedRow = rowify('Predicted', predicted, comparePredicted);
        requiredRow = rowify('Required', required, compareRequired);
        bestRow = rowify('Best case', best, compareBest);
        worstRow = rowify('Worst case', worst, compareWorst);
        targetRow = rowify('Target', target, compareTarget);
      }

      let header = null;
      if (compareData) {
        header = (
          <Thead>
            <Tr>
              <Th />
              <Th>{municipality}</Th>
              <Th>{compareMunicipality}</Th>
            </Tr>
          </Thead>
        );
      }

      return (
        <Container bg="white" borderWidth="1px" borderRadius="0.5em" p="0.5em">
          <Stack>
            <Heading p="0.5em" size="md">
              {label}
            </Heading>
            <Table variant="simple">
              {header}
              <Tbody p="0px">
                {valueRow}
                {predictedRow}
                {requiredRow}
                {bestRow}
                {worstRow}
                {targetRow}
              </Tbody>
            </Table>
          </Stack>
        </Container>
      );
    }

    return null;
  }
}

const max = (a: number, b: number): number => (a > b ? a : b);

const GDCPlot: React.FC<PlotProps> = (props: PlotProps) => {
  const { municipality, data, currentYear, compareData, compareMunicipality } = props;

  let maxDeadline = currentYear;
  const dataIsIndicatorScore = (data as IndicatorScore).goal !== undefined;
  const compareIsIndicatorScore =
    compareData !== undefined && (compareData as IndicatorScore).goal !== undefined;
  if (dataIsIndicatorScore && compareIsIndicatorScore) {
    maxDeadline = max(
      (data as IndicatorScore).goal.deadline,
      (compareData as IndicatorScore).goal.deadline,
    );
  } else if (dataIsIndicatorScore) {
    maxDeadline = (data as IndicatorScore).goal.deadline;
  } else if (compareIsIndicatorScore) {
    maxDeadline = (compareData as IndicatorScore).goal.deadline;
  }

  const getPlotData = (score: IndicatorScore | IndicatorWithoutGoal): Prediction[] => {
    const { currentCAGR } = score;
    const requiredCAGR =
      (score as IndicatorScore).goal !== undefined ? (score as IndicatorScore).requiredCAGR : NaN;

    const target =
      (score as IndicatorScore).goal !== undefined ? (score as IndicatorScore).goal.target : NaN;

    const bestCAGR =
      score.yearlyGrowth.length > 0 ? score.yearlyGrowth[score.yearlyGrowth.length - 1].value : 0;
    const worstCAGR = score.yearlyGrowth.length > 0 ? score.yearlyGrowth[0].value : 0;

    const predictions: Prediction[] = [];

    // Initial dummy in order for all plots to start at the same ...
    score.historicalData.forEach((val) => {
      predictions.push({
        year: val.year,
        value: val.value,
        bounds: [NaN, NaN],
        predicted: NaN,
        required: NaN,
        target,

        compareValue: NaN,
        compareBounds: [NaN, NaN],
        comparePredicted: NaN,
        compareRequired: NaN,
        compareTarget: NaN,
      });
    });

    const currentValue = predictions[predictions.length - 1].value;

    // Modify last point in predictions in order to have a common starting point...
    predictions[predictions.length - 1].predicted = currentValue;
    predictions[predictions.length - 1].bounds = [currentValue, currentValue];
    predictions[predictions.length - 1].required = currentValue;

    for (let year = currentYear + 1; year <= maxDeadline; year += 1) {
      const prediction = currentValue * (currentCAGR + 1.0) ** (year - currentYear);
      const best = currentValue * (bestCAGR + 1.0) ** (year - currentYear);
      const worst = currentValue * (worstCAGR + 1.0) ** (year - currentYear);
      const required = currentValue * (requiredCAGR + 1.0) ** (year - currentYear);

      predictions.push({
        year,
        predicted: prediction,
        bounds: [best, worst],
        required,
        target,
        value: NaN,

        compareValue: NaN,
        compareBounds: [NaN, NaN],
        comparePredicted: NaN,
        compareRequired: NaN,
        compareTarget: NaN,
      });
    }

    return predictions;
  };

  const predictions = getPlotData(data);

  if (compareData !== undefined) {
    const compPredictions = getPlotData(compareData);

    // Try to unify data
    const compareByYear = new Map<number, Prediction>();
    compPredictions.forEach((comp) => {
      compareByYear.set(comp.year, comp);
    });

    for (let i = 0; i < predictions.length; i += 1) {
      const pred = predictions[i];
      const compPred = compareByYear.get(pred.year);
      if (compPred !== undefined) {
        pred.compareValue = compPred.value;
        pred.compareBounds = compPred.bounds;
        pred.comparePredicted = compPred.predicted;
        pred.compareRequired = compPred.required;
        pred.compareTarget = compPred.target;

        compareByYear.delete(compPred.year);
      }
    }

    // compareByYear now contains just the values / predictions not present in the initial dataset.
    // insert these in the back, and resort the predictions array...
    if (compareByYear.size > 0) {
      compareByYear.forEach((comp, year) => {
        predictions.push({
          year,
          predicted: NaN,
          bounds: [NaN, NaN],
          required: NaN,
          value: NaN,
          target: NaN,

          compareValue: comp.value,
          compareBounds: comp.bounds,
          comparePredicted: comp.predicted,
          compareRequired: comp.required,
          compareTarget: comp.target,
        });
      });

      predictions.sort((a, b) => a.year - b.year);
    }
  }

  let compareValues = null;
  let compareBounds = null;
  let comparePredicted = null;
  let compareRequired = null;
  let compareTarget = null;
  if (compareData !== undefined) {
    compareBounds = (
      <Area
        name="Bounds"
        type="natural"
        dataKey="compareBounds"
        fill="#990000"
        fillOpacity="0.15"
        stroke="none"
      />
    );
    compareValues = (
      <Line name="Existing values" type="natural" dataKey="compareValue" stroke="#990000" />
    );
    comparePredicted = (
      <Line
        name="Predicted values"
        type="natural"
        dataKey="comparePredicted"
        stroke="#990000"
        strokeDasharray="3 3"
      />
    );
    compareRequired = (
      <Line
        name="Values required to reach target"
        type="natural"
        dataKey="compareRequired"
        stroke="black"
        strokeDasharray="3 3"
      />
    );
    compareTarget = (
      <Line name="Target" type="natural" dataKey="compareTarget" stroke="#800500" dot={false} />
    );
  }

  // Default blue colour: curious blue
  // "suitable" complement: crimson
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={800}
      minHeight={500}
      maxHeight={50000}
    >
      <ComposedChart
        width={800}
        height={500}
        data={predictions}
        margin={{
          top: 20,
          bottom: 20,
          right: 20,
          left: 0,
        }}
      >
        <CartesianGrid />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip
          content={(
            <CustomTooltip
              currentYear={currentYear}
              municipality={municipality}
              compareData={compareData}
              compareMunicipality={compareMunicipality}
            />
          )}
        />
        <Legend
          content={(
            <CustomLegend
              municipality={municipality}
              compareMunicipality={compareMunicipality}
              compareData={compareData}
            />
          )}
        />
        <Area name="Bounds" type="natural" dataKey="bounds" fillOpacity="0.15" stroke="none" />
        <Line name="Existing values" type="natural" dataKey="value" />
        <Line name="Predicted values" type="natural" dataKey="predicted" strokeDasharray="3 3" />
        <Line
          name="Values required to reach target"
          type="natural"
          dataKey="required"
          stroke="black"
          strokeDasharray="3 3"
        />
        <Line name="Target" type="natural" dataKey="target" stroke="#0050B5" dot={false} />
        {compareBounds}
        {compareValues}
        {comparePredicted}
        {compareRequired}
        {compareTarget}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

GDCPlot.defaultProps = defaultProps;

export default GDCPlot;
