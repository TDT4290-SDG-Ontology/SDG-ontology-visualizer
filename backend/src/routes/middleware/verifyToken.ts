import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../auth/credentials';
import { ApiError } from '../../types/errorTypes';
import onError from './onError';

export default (req: Request, res: Response, next: NextFunction) => {
  try {    
    if (req.body === undefined || req.body === null) throw new ApiError(401, 'Missing body');

    if (req.body.token === undefined)
      throw new ApiError(401, "Missing auth token");

    if (verifyToken(req.body.token)) {
      next();
    } else {
      onError(new Error('Server could not verify token'), req, res);
    }
  } catch (e) {
    onError(new Error('Server could not verify token'), req, res);
  }
};
