export type LoginState = {
  token: string | null;
};

export type LoginSuccessStateAction = {
  type: typeof LOGIN_SUCCESS;
  payload: string;
};

export type LoginFailedStateAction = {
  type: typeof LOGIN_FAILED;
};

export type TokenVerifiedStateAction = {
  type: typeof TOKEN_VERIFIED;
  payload: string;
};

export type TokenUnverifiedStateAction = {
  type: typeof TOKEN_UNVERIFIED;
};

export type LoginStateAction =
  | LoginSuccessStateAction
  | LoginFailedStateAction
  | TokenVerifiedStateAction
  | TokenUnverifiedStateAction;

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const TOKEN_VERIFIED = 'TOKEN_VERIFIED';
export const TOKEN_UNVERIFIED = 'TOKEN_UNVERIFIED';
