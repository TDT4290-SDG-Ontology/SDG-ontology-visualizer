import { Router, Request, Response } from 'express';
import _ from 'lodash';
import multer from 'multer';

import { parseCSV, detectSeparator } from '../utils/csv';
import { u4sscKpiMap, u4sscKpiDataseries, TKTransform } from '../database/u4sscKpiMap';

import setData from '../database/setData';
import getDataSeries from '../database/getDataSeries';
import getDataSeriesForMunicipality from '../database/getDataSeriesForMunicipality';
import deleteDataPoint from '../database/deleteDataPoint';
import getAvailableYears from '../database/getAvailableYears';

import bulkDeleteDataPoints from '../database/bulkDeleteDataPoints';
import bulkInsertDataPoints from '../database/bulkInsertDataPoints';

import CheckMunicipalityByCode from '../database/CheckMunicipalityByCode';

import { ApiError } from '../types/errorTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';
import verifyToken from './middleware/verifyToken';

import { DataPoint } from '../types/ontologyTypes';

const router = Router();

const insertData = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.body.year, 10);
    if (Number.isNaN(year)) throw new ApiError(400, 'Year not an int.');

    const isDummy = req.body.isDummy !== undefined && JSON.parse(req.body.isDummy);
    const indicatorName: string | undefined = u4sscKpiMap.get(req.body.indicator);
    if (indicatorName === undefined || !(typeof indicatorName === 'string'))
      throw new ApiError(400, 'Unknown indicator');

    const newDataPoint = {
      indicatorId: req.body.indicator,
      indicatorName,
      municipality: req.body.municipality,
      data: req.body.data,
      year,
      isDummy,
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

const insertBulkData = async (req: Request, res: Response) => {
  try {
    const isDummy = req.body.isDummy !== undefined && JSON.parse(req.body.isDummy);
    const { municipality } = req.body;
    const year = parseInt(req.body.year, 10);
    if (Number.isNaN(year)) throw new ApiError(400, 'Year not an int.');

    const validMunicipality = await CheckMunicipalityByCode(municipality);
    if (validMunicipality === 0) throw new ApiError(400, 'Invalid municipality id');

    const datapoints: DataPoint[] = [];

    req.body.data.forEach((dp) => {
      const indicatorName = u4sscKpiMap.get(dp.indicator);
      if (indicatorName === undefined)
        throw new ApiError(400, `Unknown indicator: ${dp.indicator}`);

      const datapoint: DataPoint = {
        municipality,
        indicatorId: dp.indicator,
        indicatorName,
        data: dp.data,
        year,
        isDummy,
        dataseries: dp.dataseries,
      };

      datapoints.push(datapoint);
    });

    await bulkDeleteDataPoints(datapoints);
    await bulkInsertDataPoints(municipality, datapoints);

    res.json({});
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

        Object.keys(data2).forEach((key2) => {
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

const availableYears = async (req: Request, res: Response) => {
  try {
    const data = await getAvailableYears(req.params.municipality);
    res.json(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

type CSVErrorMessage = {
  data: any;
  message: string;
};

const dataUploadCSV = async (req: Request, res: Response) => {
  try {
    const { municipality } = req.body;
    if (!municipality) throw new ApiError(401, 'Missing municipality');

    const validMunicipality = await CheckMunicipalityByCode(municipality);
    if (validMunicipality === 0) throw new ApiError(400, 'Invalid municipality id');

    const year = parseInt(req.body.year, 10);
    if (Number.isNaN(year) || year <= 0)
      throw new ApiError(401, 'Invalid year (must be a positive integer)');

    const isDummy = req.body.isDummy !== undefined && JSON.parse(req.body.isDummy);

    const { buffer } = (req as any).file;
    const str = buffer.toString();

    const header = str.split('\n')[0].trim();
    const separator = detectSeparator(header);

    // validate that headers are correct
    const fields = header.split(separator);
    const requiredFields = new Set(['indicator', 'dataseries', 'data']);
    fields.forEach((field) => {
      if (!requiredFields.has(field)) throw new ApiError(401, `Unrecognized CSV field: '${field}'`);
      else requiredFields.delete(field);
    });

    if (requiredFields.size !== 0)
      throw new ApiError(
        401,
        `Missing required CSV fields: ${Array.from(requiredFields).map((f) => `${f}, `)}`,
      );

    const data = await parseCSV(buffer, { separator });

    // Validate datapoints
    const datapoints: DataPoint[] = [];
    const errors: CSVErrorMessage[] = [];
    data.forEach((dp) => {
      let { indicator } = dp;
      const tkTransform = TKTransform.get(indicator);
      if (tkTransform) indicator = tkTransform;

      const indicatorName = u4sscKpiMap.get(indicator);
      if (!indicatorName) errors.push({ data: dp, message: 'Unrecognized KPI' });
      else {
        const dataseries = u4sscKpiDataseries.get(indicator);
        if (dataseries && !dataseries.has(dp.dataseries)) {
          errors.push({ data: dp, message: 'Missing / unrecognized required data series' });
        } else if (!dataseries && dp.dataseries !== '') {
          errors.push({ data: dp, message: 'Dataseries present in indicator not having one' });
        } else {
          const value = JSON.parse(dp.data);
          const valueAsNumber = Number(value);
          if (Number.isNaN(valueAsNumber))
            errors.push({
              data: dp,
              message: `Value is in an incompatible format: '${typeof value}'`,
            });

          const datapoint: DataPoint = {
            municipality,
            indicatorId: indicator,
            indicatorName,
            data: valueAsNumber,
            year,
            isDummy,
            dataseries: dp.dataseries === '' ? 'main' : dp.dataseries,
          };

          datapoints.push(datapoint);
        }
      }
    });

    if (errors.length > 0) {
      throw new ApiError(401, `Data errors: ${JSON.stringify(errors)}`);
    }

    await bulkDeleteDataPoints(datapoints);
    await bulkInsertDataPoints(municipality, datapoints);

    res.json({});
  } catch (e) {
    onError(e, req, res);
  }
};

router.post('/insert', verifyDatabaseAccess, verifyToken, insertData);
router.post('/insert-bulk', verifyDatabaseAccess, verifyToken, insertBulkData);
router.post('/get', verifyDatabaseAccess, getData);
router.post('/get-all-dataseries', verifyDatabaseAccess, getAllData);

router.get('/available-years/:municipality', verifyDatabaseAccess, availableYears);

router.post('/upload', verifyToken, verifyDatabaseAccess, upload.single('csv'), dataUploadCSV);

export default router;
