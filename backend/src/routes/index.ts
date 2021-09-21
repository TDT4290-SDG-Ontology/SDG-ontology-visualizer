import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';
import dataEntry from './dataEntry';

const router = Router();

router.use('/ontologies', ontologies);
router.use('/auth', authorization);
router.use('/dataEntry', dataEntry);

export default router;
