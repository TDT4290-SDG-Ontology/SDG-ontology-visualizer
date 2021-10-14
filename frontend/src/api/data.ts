import api from './api';

export const getAvailableYears = async (municipality: string): Promise<Array<number>> => {
  try {
    const data: Array<number> = await api.GET(`data/available-years/${municipality}`);
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const dummy = async () => 1;
