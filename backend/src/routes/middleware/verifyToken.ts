/* eslint-disable @typescript-eslint/no-unused-vars -- no-unused-vars disabled in order to help further development */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../auth/credentials';
import { ApiError } from '../../types/errorTypes';
import onError from './onError';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined = req.body ? req.body.token : undefined;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
      token = req.headers.authorization.substring(7);

    if (!token) throw new ApiError(400, 'Missing auth token');

    if (!(typeof token === 'string')) throw new ApiError(400, 'Token has wrong type.');

    if (verifyToken(token)) {
      next();
    } else {
      throw new ApiError(400, 'Server could not verify token.');
    }
  } catch (e) {
    onError(e, req, res);
  }
};
