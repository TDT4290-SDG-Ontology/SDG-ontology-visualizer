import api from './api';

export const validateToken = async (token: string): Promise<boolean> => {
  const responseHandler = async (res: Response): Promise<boolean> => !!res.ok;
  try {
    const data = await api.POST('auth/check-token', { token }, {}, responseHandler);
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const login = async (username: string, password: string): Promise<string | null> => {
  const responseHandler = async (res: Response): Promise<string | null> => {
    if (!res.ok) {
      return null;
    }

    return res.json();
  };

  try {
    const data = await api.POST('auth/login', { username, password }, {}, responseHandler);
    return data ? data.token : null;
  } catch (e) {
    console.log(e);
    return null;
  }
};
