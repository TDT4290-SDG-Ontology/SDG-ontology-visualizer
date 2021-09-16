import { Router, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { ApiError } from '../types/errorTypes';
import { HashEntry } from '../types/userTypes';

import onError from './middleware/onError';
import verifyDatabaseAccess from './middleware/verifyDatabaseAccess';

import getUserPasswordHash from '../database/getUserPasswordHash';
import { checkPassword } from '../auth/credentials';
import config from '../config';

const router = Router();

const login = async (req: Request, res: Response) => {
  try {
    if (req.body === undefined || req.body === null) throw new ApiError(401, 'Missing body');

    if (req.body.username === undefined || req.body.password === undefined)
      throw new ApiError(400, "Missing one or more of required fields 'username' and 'password'!");

    const records: Array<HashEntry> = await getUserPasswordHash(req.body.username);

    // NOTE: This is structured a bit weirdly in order to prevent attackers from
    // enumerating all usernames in the database. We purposefully don't give them
    // information in order to avoid the previously mentioned enumeration attack.
    if (records === null || records === undefined || records.length !== 1) {
      throw new ApiError(401, 'Invalid username or password');
    } else {
      const { hash } = records[0];
      if (checkPassword(req.body.password, hash)) {
        // TODO: tune token expiration, currently 24h.
        const expiry: number = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        const jwtToken = jwt.sign(
          {
            exp: expiry,
            username: req.body.username,
            apiAvailable: true,
          },
          config.JWT_SECRET_TOKEN,
        );
        res.json({ token: jwtToken });
      } else {
        throw new ApiError(401, 'Invalid username or password');
      }
    }
  } catch (e) {
    onError(e, req, res);
  }
};

router.post('/login', verifyDatabaseAccess, login);

export default router;
