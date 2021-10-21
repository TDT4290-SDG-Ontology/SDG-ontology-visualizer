import api from './api';

export const validateToken = async (token: string): Promise<any> => {
  try {
    const data = await api.POST('auth/check-token', { token });
    return data;
  } catch (e) {
    console.log(e);
    return '';
  }
};

export const login = async (username: string, password: string): Promise<string | null> => {
  try {
    const data = await api.POST('auth/login', { username, password });
    return data.token;
  } catch (e) {
    console.log(e);
    return null;
  }
};
