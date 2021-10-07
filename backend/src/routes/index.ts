import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';
import data from './data';
import gdc from './gdc';
import municipality from './municipality';

const router = Router();

router.use('/ontologies', ontologies);
router.use('/auth', authorization);
router.use('/data', data);
router.use('/gdc', gdc);
router.use('/municipality', municipality);

export default router;
