import { Router } from 'express';

import ontologies from './ontologies';
import authorization from './authorization';
import data from './data';
import { getLoginStatus } from '../database/login';

const router = Router();

router.use('/ontologies', ontologies);
router.use('/auth', authorization);
router.use('/data', data);

router.use('/isAlive', (req, res) => {
  res.send('true');
});

router.use('/isLoggedIn', (req, res) => {
  res.send(getLoginStatus());
});

export default router;
