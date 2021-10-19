import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../../auth/credentials';
import { ApiError } from '../../types/errorTypes';
import onError from './onError';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    if (verifyAdminToken(req.body.token)) {
      next();
    } else {
      throw new ApiError(400, 'You need to be an admin to access this endpoint.');
    }
  } catch (e) {
    onError(e, req, res);
  }
};
