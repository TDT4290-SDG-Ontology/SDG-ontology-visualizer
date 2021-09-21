import { Router } from 'express';
// import { verifyRequestQueryParams } from '../common/router';
import setData from '../database/setData';
import { ClassRequest, SetResponse } from '../types/routerTypes';
import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';

const router = Router();

const TrySetData = async (req: ClassRequest, res: SetResponse) => {
  try {
    const newClass = {
      name: req.body.name,
      discription: req.body.discription,
      moreInformation: req.body.moreInformation,
    };
    console.log(newClass.name);
    const data = await setData(newClass);
    console.log(data);
  } catch (e: any) {
    onError(e, req, res);
  }
};

router.post('/testInput', verifyDatabaseAccess, TrySetData);

export default router;
