import { Router, Request, Response } from 'express';
import _ from 'lodash';
import setData from '../database/setData';
import getDataSeries from '../database/getDataSeries';
import { u4sscKpiMap } from '../database/u4sscKpiMap';
import getDataSeriesForMunicipality from '../database/getDataSeriesForMunicipality';
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

    await deleteDataPoint(newDataPoint);

    // Insert new datapoint.
    await setData(newDataPoint);
    res.status(200).json({});
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getData = async (req: Request, res: Response) => {
  try {
    const data = await getDataSeries(req.body.indicator, req.body.municipality, req.body.year);
    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

/**
 * Endpoint for
 * @param req
 * @param res
 */
const getAllData = async (req: Request, res: Response) => {
  try {
    let data = await getDataSeriesForMunicipality(req.body.municipality);

    // Group by kpiNumber and then potentially dataseriesVariant
    // Also removes all properties but value and year from the datapoints themselves
    data = _.chain(data)
      .groupBy('kpiNumber')
      .map((value, key) => {
        if (value[0].dataseriesVariant === undefined) {
          return { kpiNumber: key, data: value.map(({ kpiNumber, ...item }) => item) };
        }
        const data2 = _.groupBy(value, 'dataseriesVariant');

        // eslint-disable-next-line array-callback-return
        Object.keys(data2).map((key2) => {
          data2[key2] = data2[key2].map(({ kpiNumber, dataseriesVariant, ...item }) => item);
        });
        return { kpiNumber: key, data: data2 };
      })
      .value();
    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/insert', verifyDatabaseAccess, verifyToken, insertData);
router.post('/get', verifyDatabaseAccess, getData);
router.post('/get-all-dataseries', verifyDatabaseAccess, getAllData);

export default router;
