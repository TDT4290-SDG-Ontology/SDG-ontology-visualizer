import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';

const router = Router();

router.use('/ontologies', ontologies);
router.use('/auth', authorization);

export default router;
