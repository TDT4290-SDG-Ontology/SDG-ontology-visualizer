import { Router, Request, Response } from 'express';

import getGDCDataSeries from '../database/getGDCDataSeries';
import getGDCDataSeriesUpto from '../database/getGDCDataSeriesUpto';
import getGDCGoals from '../database/getGDCGoals';
import setGDCGoal from '../database/setGDCGoal';
import deleteGDCGoal from '../database/deleteGDCGoal';
import getCorrelatedKPIs from '../database/getCorrelatedKPIs';
import bulkDeleteGDCGoals from '../database/bulkDeleteGDCGoals';
import bulkInsertGDCGoals from '../database/bulkInsertGDCGoals';
import CheckMunicipalityByCode from '../database/CheckMunicipalityByCode';

import { Goal, Dataseries, GDCGoal, GDCOutput } from '../types/gdcTypes';
import { computeGDC } from '../gdc/gdc';
import { gdc2json } from '../utils/gdcUtils';

import { u4sscKpiMap } from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';

import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

const getGoalDistance = async (req: Request, res: Response) => {
  try {
    const goalMunicipality =
      req.body.goalOverride !== undefined ? req.body.goalOverride : req.body.municipality;

    const dataseriesPromise = getGDCDataSeries(req.body.municipality, req.body.year);
    const goalPromise = getGDCGoals(goalMunicipality, req.body.municipality);
    const historicalPromise = getGDCDataSeriesUpto(req.body.municipality, req.body.year);

    // It should be more efficient to wait on all promises at the same time.
    const data = await Promise.all([dataseriesPromise, goalPromise, historicalPromise]);
    const dataseries: Dataseries[] = data[0];
    const goals: Goal[] = data[1];
    const historicalData: Dataseries[] = data[2];

    if (!dataseries || !goals || !historicalData)
      throw new ApiError(400, 'Missing goals, data, or historical data for municipality.');

    const gdcOutput: GDCOutput = computeGDC(dataseries, goals, historicalData);

    res.json(gdc2json(gdcOutput));
  } catch (e: any) {
    onError(e, req, res);
  }
};

const setGoal = async (req: Request, res: Response) => {
  try {
    const isDummy = req.body.isDummy !== undefined && req.body.isDummy;
    const dataseries =
      req.body.dataseries === undefined || req.body.dataseries === null
        ? 'main'
        : req.body.dataseries;

    const indicatorName = u4sscKpiMap.get(req.body.indicator);
    if (indicatorName === undefined) throw new ApiError(400, '!');

    // TODO: figure out how to do this properly, as a DELETE/INSERT query instead...
    await deleteGDCGoal(req.body.municipality, req.body.indicator, dataseries, isDummy);
    await setGDCGoal(
      req.body.municipality,
      req.body.indicator,
      indicatorName,
      dataseries,
      req.body.target,
      req.body.deadline,
      req.body.baseline,
      req.body.baselineYear,
      req.body.startRange,
      isDummy,
    );
    res.json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const setBulkGoals = async (req: Request, res: Response) => {
  try {
    const isDummy = req.body.isDummy !== undefined && req.body.isDummy;
    const { municipality } = req.body;

    const validMunicipality = await CheckMunicipalityByCode(municipality);
    if (validMunicipality === 0) throw new ApiError(400, 'Invalid municipality id');

    const goals: GDCGoal[] = [];

    req.body.goals.forEach((goal) => {
      const dataseries =
        goal.dataseries === undefined || goal.dataseries === null ? 'main' : goal.dataseries;

      const indicatorName = u4sscKpiMap.get(goal.indicator);
      if (indicatorName === undefined) throw new ApiError(400, '!');

      const newGoal: GDCGoal = {
        municipality,
        indicatorId: goal.indicator,
        indicatorName,
        dataseries,

        target: goal.target,
        deadline: goal.deadline,
        baseline: goal.baseline,
        baselineYear: goal.baselineYear,
        startRange: goal.startRange,
        isDummy,
      };

      goals.push(newGoal);
    });

    await bulkDeleteGDCGoals(goals);
    await bulkInsertGDCGoals(municipality, goals);

    res.json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getGoals = async (req: Request, res: Response) => {
  try {
    const goalsData = await getGDCGoals(req.params.municipality, req.params.municipality);
    const goals: Map<string, Goal> = new Map<string, Goal>();

    goalsData.forEach((goal) => {
      const isVariant = goal.dataseries !== undefined;
      const displayKPI = goal.kpi + (isVariant ? ` - ${goal.dataseries}` : '');
      goals.set(displayKPI, goal);
    });

    res.json({
      goals: [...goals],
    });
  } catch (e: any) {
    onError(e, req, res);
  }
};

const correlatedKPIs = async (req: Request, res: Response) => {
  try {
    // NOTE: we currently have correlation data for south korea and japan loaded,
    // which were the "most" developed countries we could get data for.
    // A SDG target correlation mapping for Norway should be extant, but we did not have access to it,
    // and this could be a good use case for publishing these.
    //
    // Further, as the correlations are approximated through the SDG targets, they will be somewhat
    // crude, but should be useful enough to distinguish rough categories of synergies / tradeoffs.
    // Someone might want to investigate the correlations between U4SSC KPIs in order to map this more
    // accurately.

    const resp = await getCorrelatedKPIs('kr', req.params.indicator);
    res.json(resp);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/get', verifyDatabaseAccess, getGoalDistance);
router.post('/set-goal', verifyDatabaseAccess, verifyToken, setGoal);
router.post('/set-bulk-goals', verifyDatabaseAccess, verifyToken, setBulkGoals);
router.get('/goals/:municipality', verifyDatabaseAccess, getGoals);
router.get('/correlated-kpis/:indicator', verifyDatabaseAccess, correlatedKPIs);

export default router;
