import api, { API_BASE, responseHandler } from './api';

export const getAvailableYears = async (municipality: string): Promise<Array<number>> => {
  try {
    const data: Array<number> = await api.GET(`data/available-years/${municipality}`);
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const uploadDataCSV = async (token: string, formData: FormData): Promise<boolean> => {
  try {
    // Have to do this in order to send form data...
    // TODO: refactor into helper function in api.ts
    return await window
      .fetch(`${API_BASE}/data/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      .then(responseHandler)
      .then(() => true)
      .catch(() => false);
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const dummy = async () => 1;
