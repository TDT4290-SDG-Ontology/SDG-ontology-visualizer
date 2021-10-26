import api, { API_BASE } from './api';

export const getAvailableYears = async (municipality: string): Promise<Array<number>> => {
  try {
    const data: Array<number> = await api.GET(`data/available-years/${municipality}`);
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const uploadDataCSV = async (token: string, formData: FormData): Promise<any> => {
  try {
    // Have to do this in order to send form data...
    // TODO: refactor into helper function in api.ts
    await window.fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (e) {
    console.log(e);
  }
};

export const dummy = async () => 1;
