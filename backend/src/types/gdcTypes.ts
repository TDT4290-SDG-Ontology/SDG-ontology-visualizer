export type Goal = {
  kpi: string;
  baseline: number;
  baselineYear: number;
  target: number;
  deadline: number;
  startRange: number;
  dataseries: string?;
};

export type Dataseries = {
  kpi: string;
  year: number;
  value: number;
  dataseries: string?;
};
