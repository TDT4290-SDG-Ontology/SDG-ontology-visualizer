import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../../auth/credentials';
import { ApiError } from '../../types/errorTypes';
import onError from './onError';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined = req.body ? req.body.token : undefined;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
      token = req.headers.authorization.substring(7);

    if (!token) throw new ApiError(400, 'Missing auth token');

    if (!(typeof token === 'string')) throw new ApiError(400, 'Token has wrong type.');

    if (verifyAdminToken(token)) {
      next();
    } else {
      throw new ApiError(400, 'You need to be an admin to access this endpoint.');
    }
  } catch (e) {
    onError(e, req, res);
  }
};
