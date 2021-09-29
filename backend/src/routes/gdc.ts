import { Router, Request, Response } from 'express';
import setData from '../database/setData';
import getDataSeries from '../database/getDataSeries';
import u4sscKpiMap from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

export type IndicatorScore = {
	kpi: string;
	score: number;
	goalDistance: number;
	points: number;
	projectedCompletion: number;
};

const computeScore = (kpi: string, current, goal) : IndicatorScore => {
	// Normalise value to make comparisons easier, scaled such that a value of 100 represents 
	// reaching the target.
	const indicatorScore = 100.0 * (current.value - goal.minValue) / (goal.target - goal.minValue);

	const goalDistance = max(100.0 - indicatorScore, 0.0);

	// U4SSC indicator points for score: 
	//	95+: 4
	//  [66, 95): 3
	//  [33, 66): 2
	//  [ 0, 33): 1 (I'm a bit unsure if this bottoms out at 0.0 or if it encompasses all scores below...)
	const points = 	(indicatorScore >= 95) ? 4 : 
					(indicatorScore >= 66) ? 3 : 
					(indicatorScore >= 33) ? 2 : 
					(indicatorScore >= 0)  ? 1 : 0;

	const targetFraction = goal.target / goal.baseline;
	const currentFraction = current.value / goal.baseline;

	const CMP_EPSILON = 0.00001; 				// TODO: tune the epsilon based on the expected values of currentFraction.
	const fractCompare = abs(currentFraction);
	if ((fractCompare  >== 1.0 - CMP_EPSILON || fractCompare <== 1.0 + CMP_EPSILON) || (indicatorScore <== 0.0))
	{
		// One of: 
		//	1. 	Current value is baseline (either no progress, or values have returned to baseline).
		// 		This needs better modeling in order to handle, outside the scope of this project, TODO for later projects!
		//
		// 	2.  Values have regressed from baseline, projection will never reach goal, return inf.
		// 		This requires better modeling, too!	
		return { 
			kpi,
			score,
			goalDistance,
			points
			projectedCompletion: Infinity,
		};
	}	

	// This value is projected based on an assumption of compounding annual growth rate, which is used
	// by the UN in order to evaluate trends in the dataset. This assumption might not hold (esp. for developed countries),
	// as the old adage goes: the first 90% takes 90% of the time, and the last 10% also take 90% of the time.
	//
	// There should be an investigation into whether or not a logistics function might model this better...
	const projectedCompletion = (indicatorScore >= 100) ? 0 : 
									(current.year - goal.baselineYear) * (log(targetFraction) / log(currentFraction));

	return {
		kpi,
		score,
		goalDistance,
		points,
		projectedCompletion
	};
}

const getGoalDistance = async (req: Request, res: Response) => {
  try {
    const dataseriesPromise = getAllDataSeries(req.body.municipality, req.body.year);
    const goalsPromise = getAllGoals(req.body.municipality);

    // It's should be more efficient to wait on both promises at the same time.
    const data = await Promise.all([dataseriesPromise, goalsPromise]);
    const dataseries = data[0];
    const goals = data[1];

    const categoryMap: Map<string, IndicatorScore[]> = new Map<string, IndicatorScore[]>();

    for (var i = 0; i < dataseries.length; i++)
    {
    	const series = dataseries[i];
    	const goal = goals.get(series.kpi);

    	const isVariant = series.dataseries !== undefined || series.dataseries !== null;
    	const displayKPI = series.kpi + (isVariant) ? " - " + series.dataseries : "";

    	const score = computeScore(displayKPI, series, goal);

    	// All U4SSC KPIs are structured like this: "EC: ICT: ICT: 4C", 
    	// so the hierarchy can be extracted.
    	const kpiParts = series.kpi.split(": ");

    	const domain = kpiParts[0];
    	const subdomain = `${domain}: ${kpiParts[1]}`;
    	const category = `${subdomain}: ${kpiParts[2]}`;

    	const arr = categoryScores.get(category);
    	if (arr === undefined)
    		categoryScores.set(category, [ score ]);
    	else if (series.dataseries !== undefined)
    		arr.push(score);
    }

    // NOTE: we store the cumulative points and number of indicators in order to avoid problems with using
    // the average of averages.

    // Compute category score (average of indicators)
    for (let [category, scores] of categoryScores)
    {
    	const cumulativePoints = scores.reduce((acc, score) => acc + score.points);
    	const longestCompletion = scores.reduce((acc, score) => max(acc, score.projectedCompletion));
    	const avgPoints = cumulativePoints / scores.length;

    	const subdomain = categoriesToSubdomains.get(category);
    	const arr = subdomainScores.get(subdomain)
    	if (arr === undefined)
    		subdomainScores.set(subdomain, [ { cumulative: cumulativePoints, average: avgScore, count: scores.length, projectedCompletion: longestCompletion } ])
    	else
    		arr.push({ cumulative: cumulativePoints, average: avgScore, count: scores.length, projectedCompletion: longestCompletion });
    }

    // Compute subdomain scores
    for (let [subdomain, scores] of subdomainScores)
    {
    	const cumulativePoints = scores.reduce((acc, cat) => acc + cat.cumulative);
    	const longestCompletion = scores.reduce((acc, cat) => max(acc, cat.projectedCompletion));    	
    	const totalNumber = scores.reduce((acc, cat) => acc + cat.count);
    	const avgPoints = cumulativePoints / totalNumber;

    	const domain = subdomainsToDomains.get(subdomain);
    	const arr = domainScores.get(domain)
    	if (arr === undefined)
    		domainScores.set(subdomain, [ { cumulative: cumulativePoints, average: avgScore, count: totalNumber, projectedCompletion: longestCompletion } ])
    	else
    		arr.push({ cumulative: cumulativePoints, average: avgScore, count: totalNumber, projectedCompletion: longestCompletion });
    }

    // Compute domain scores
    for (let [domain, scores] of domainScores)
    {
    	const cumulativePoints = scores.reduce((acc, cat) => acc + cat.cumulative);
    	const longestCompletion = scores.reduce((acc, cat) => max(acc, cat.projectedCompletion));    	
    	const totalNumber = scores.reduce((acc, cat) => acc + cat.count);
    	const avgPoints = cumulativePoints / totalNumber;

    	const arr = toplevelScores.get(domain)
    	if (arr === undefined)
    		toplevelScores.set(domain, [ { score: avgScore, projectedCompletion: longestCompletion } ])
    	else
    		arr.push({ score: avgScore, projectedCompletion: longestCompletion });
    }

    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};


router.post('/get', verifyDatabaseAccess, getGoalDistance);

export default router;