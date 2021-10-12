import { Router, Request, Response } from 'express';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';

import getSimilarlySizedMunicipalities from '../database/getSimilarlySizedMunicipalities';
import getAllMunicipalities from '../database/getAllMunicipalities';
import getMunicipalityInfo from '../database/getMunicipalityInfo';

const router = Router();

const findSimilar = async (req: Request, res: Response) => {
  try {
    const resp = await getSimilarlySizedMunicipalities(req.params.code, 0.25);
    res.json(resp);
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const resp = await getAllMunicipalities();
    res.json(resp);
  } catch (e: any) {
    onError(e, req, res);
  }
};

const getInfo = async (req: Request, res: Response) => {
  try {
    const resp = await getMunicipalityInfo(req.params.code);
    if (resp) res.json(resp[0]);
    else res.json([]);
  } catch (e: any) {
    onError(e, req, res);
  }
};

// These should really be get endpoints...
router.get('/similar/:code', verifyDatabaseAccess, findSimilar);
router.get('/info/:code', verifyDatabaseAccess, getInfo);
router.get('/all', verifyDatabaseAccess, getAll);

export default router;
