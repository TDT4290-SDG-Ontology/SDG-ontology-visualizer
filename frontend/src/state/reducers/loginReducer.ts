import {
  LoginState,
  LoginStateAction,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  TOKEN_VERIFIED,
  TOKEN_UNVERIFIED,
} from '../../types/redux/loginTypes';

const defaultState: LoginState = {
  token: null,
};

const loginReducer = (state: LoginState = defaultState, action: LoginStateAction): LoginState => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      localStorage.setItem('token', JSON.stringify(action.payload));
      return {
        ...state,
        token: action.payload,
      };
    case LOGIN_FAILED:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
      };
    case TOKEN_VERIFIED:
      localStorage.setItem('token', JSON.stringify(action.payload));
      return {
        ...state,
        token: action.payload,
      };
    case TOKEN_UNVERIFIED:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
      };
    default:
      return state;
  }
};

export const loginSuccess = (token: string): LoginStateAction => ({
  type: LOGIN_SUCCESS,
  payload: token,
});

export const loginFailed = (): LoginStateAction => ({ type: LOGIN_FAILED });

export const tokenVerified = (token: string): LoginStateAction => ({
  type: TOKEN_VERIFIED,
  payload: token,
});

export const tokenUnverified = (): LoginStateAction => ({ type: TOKEN_UNVERIFIED });

export default loginReducer;
