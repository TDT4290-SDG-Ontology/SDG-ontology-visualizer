import { Router, Request, Response } from 'express';
import _ from 'lodash';
import setData from '../database/setData';
import getDataSeries from '../database/getDataSeries';
import getDataSeriesForMunicipality from '../database/getDataSeriesForMunicipality';
import u4sscKpiMap from '../database/u4sscKpiMap';
import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';
import deleteDataPoint from '../database/deleteDataPoint';

const router = Router();

const insertData = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.body.year, 10);
    if (Number.isNaN(year)) throw new ApiError(400, 'Year not an int.');

    const indicatorName: string | undefined = u4sscKpiMap.get(req.body.indicator);
    if (indicatorName === undefined || !(typeof indicatorName === 'string'))
      throw new ApiError(400, 'Unknown indicator');

    const newDataPoint = {
      indicatorId: req.body.indicator,
      indicatorName,
      municipality: req.body.municipality,
      data: req.body.data,
      year,
      isDummy: req.body.isDummy !== undefined && req.body.isDummy,
      dataseries: req.body.dataseries,
    };
    const data = await getDataSeries(
      newDataPoint.indicatorId,
      newDataPoint.municipality,
      newDataPoint.year,
      newDataPoint.dataseries,
    );
    console.log(data);
    if (data.length > 0) {
      await deleteDataPoint(newDataPoint);
    }

    await setData(newDataPoint);
    res.status(200).json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getData = async (req: Request, res: Response) => {
  try {
    let test = await getDataSeriesForMunicipality(req.body.municipality);
    test = _.chain(test)
      // Group the elements of Array based on `color` property
      .groupBy('kpiNumber')
      // `key` is group's name (color), `value` is the array of objects
      .map((value, key) => ({ kpiNumber: key, data: value }))
      .value();
    console.log(test[0]);
    const data = await getDataSeries(req.body.indicator, req.body.municipality, req.body.year);
    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/insert', verifyDatabaseAccess, verifyToken, insertData);
router.post('/get', verifyDatabaseAccess, getData);

export default router;
