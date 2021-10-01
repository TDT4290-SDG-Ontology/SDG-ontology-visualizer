import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';
import data from './data';

const router = Router();

router.get('/isAlive', (req, res)=>{
    res.send("true")
})

router.use('/ontologies', ontologies);
router.use('/auth', authorization);
router.use('/data', data);

export default router;
