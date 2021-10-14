import api from './api';

import { Municipality, MunicipalityInfo } from '../types/municipalityTypes';

export const getAllMunicipalities = async (): Promise<Array<Municipality>> => {
  try {
    const data: Array<Municipality> = await api.GET('municipality/all');
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getSimilarMunicipalities = async (code: string): Promise<Array<Municipality>> => {
  try {
    const data: Array<Municipality> = await api.GET(`municipality/similar/${code}`);
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getMunicipalityInfo = async (code: string): Promise<MunicipalityInfo> => {
  try {
    const data: MunicipalityInfo = await api.GET(`municipality/info/${code}`);
    return data;
  } catch (e) {
    console.log(e);
    return { name: '', code: '', population: -1 };
  }
};
