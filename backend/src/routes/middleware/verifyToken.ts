/* eslint-disable @typescript-eslint/no-unused-vars -- no-unused-vars disabled in order to help further development */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../auth/credentials';
import { ApiError } from '../../types/errorTypes';
import onError from './onError';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body === undefined || req.body === null) throw new ApiError(400, 'Missing body');

    if (req.body.token === undefined) throw new ApiError(400, 'Missing auth token');

    if (!(typeof req.body.token === 'string' || req.body.token instanceof String))
      throw new ApiError(400, 'Token has wrong type.');

    if (verifyToken(req.body.token)) {
      next();
    } else {
      throw new ApiError(400, 'Server could not verify token.');
    }
  } catch (e) {
    onError(e, req, res);
  }
};
