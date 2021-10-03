import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';
import data from './data';
import gdc from './gdc';

const router = Router();

router.use('/ontologies', ontologies);
router.use('/auth', authorization);
router.use('/data', data);
router.use('/gdc', gdc);

export default router;
