import { Router, Request, Response } from 'express';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';

import getSimilarlySizedMunicipalities from '../database/getSimilarlySizedMunicipalities';

const router = Router();

const findSimilar = async (req: Request, res: Response) => {
  try {
    const resp = await getSimilarlySizedMunicipalities(req.body.municipality, 0.25);
    res.json(resp);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/similar', verifyDatabaseAccess, findSimilar);

export default router;
