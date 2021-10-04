import { expect } from 'chai';
import deleteDataPoint from '../database/deleteDataPoint';
import getDataSeries from '../database/getDataSeries';
import setData from '../database/setData';

const value = 6;
describe('Delete test', () => {
  it('delete and check the data series', async () => {
    const indicatorName = 'household_internet_access';
    const year = 2020;
    const newDataPoint = {
      indicatorId: 'EC: ICT: ICT: 1C',
      indicatorName,
      municipality: 'no.5001',
      data: value,
      year,
      isDummy: true,
    };
    await setData(newDataPoint);
    let dataSeries = await getDataSeries('EC: ICT: ICT: 1C', 'no.5001', 2020);
    expect(dataSeries).to.not.eq({});
    await deleteDataPoint(newDataPoint);
    dataSeries = await getDataSeries('EC: ICT: ICT: 1C', 'no.5001', 2020);
    expect(dataSeries).to.not.eq({});
  });
});
