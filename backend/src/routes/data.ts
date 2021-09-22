import { Router, Request, Response } from 'express';
// import { verifyRequestQueryParams } from '../common/router';
import setData from '../database/setData';
import getDataSeries from '../database/getDataSeries';
import u4sscKpiMap from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

const router = Router();

const insertData = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.body.year, 10);
    if (Number.isNaN(year)) throw new ApiError(400, 'Year not an int.');

    const newDataPoint = {
      indicatorId: req.body.indicator,
      indicatorName: u4sscKpiMap[req.body.indicator],
      municipality: req.body.municipality,
      data: req.body.data,
      year,
      isDummy: req.body.isDummy !== undefined && req.body.isDummy,
      dataseries: req.body.dataseries,
    };
    console.log(newDataPoint.indicatorName);
    const data = await setData(newDataPoint);
    console.log(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getData = async (req: Request, res: Response) => {
  try {
    const data = await getDataSeries(req.body.indicator);
    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/insert', verifyToken, verifyDatabaseAccess, insertData);
router.post('/get', verifyDatabaseAccess, getData);

export default router;
