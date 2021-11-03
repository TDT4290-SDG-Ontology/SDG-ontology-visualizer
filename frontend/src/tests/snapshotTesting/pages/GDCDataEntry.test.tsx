import React from 'react';
import renderer from 'react-test-renderer';

import GDCDataEntry from '../../../components/pages/GDCDataEntry';

it('renders page correctly', () => {
  const tree = renderer.create(<GDCDataEntry />).toJSON();
  expect(tree).toMatchSnapshot();
});
