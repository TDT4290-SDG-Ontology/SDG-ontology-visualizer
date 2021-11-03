import { setError } from '../state/reducers/apiErrorReducer';
import store from '../state/store';
import { ApiError } from '../types/redux/errorTypes';

export const API_BASE = process.env.REACT_APP_BACKEND_URL;

// JSON resolver. Throws ApiError if response is not a 2xx response.
export const responseHandler = async (res: Response, override?: any): Promise<any> => {
  if (override) {
    return override(res);
  }

  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch (e) {
      body = 'Could not parse json';
    }
    const err = new ApiError(res, body);
    store.dispatch(setError(err));
    throw err;
  }

  const json = await res.json();
  return json;
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default {
  GET: (path: string, headers?: object, handlerOverride?: any) =>
    window
      .fetch(`${API_BASE}/${path}`, { method: 'GET', headers: { ...defaultHeaders, ...headers } })
      .then((res) => responseHandler(res, handlerOverride)),
  POST: (path: string, body: object, headers?: object, handlerOverride?: any) =>
    window
      .fetch(`${API_BASE}/${path}`, {
        method: 'POST',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(body),
      })
      .then((res) => responseHandler(res, handlerOverride)),
  PUT: (path: string, body: object, headers?: object, handlerOverride?: any) =>
    window
      .fetch(`${API_BASE}/${path}`, {
        method: 'PUT',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(body),
      })
      .then((res) => responseHandler(res, handlerOverride)),
  DELETE: (path: string, body: object, headers?: object, handlerOverride?: any) =>
    window
      .fetch(`${API_BASE}/${path}`, {
        method: 'DELETE',
        headers: { ...defaultHeaders, ...headers },
        body: JSON.stringify(body),
      })
      .then((res) => responseHandler(res, handlerOverride)),
};
