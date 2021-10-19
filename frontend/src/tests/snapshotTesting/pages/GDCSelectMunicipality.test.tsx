import React from 'react';
import renderer from 'react-test-renderer';

import GDCSelectMunicipality from '../../../components/pages/GDCSelectMunicipality';
import store from '../../../state/store';

it('renders when there are no items', () => {
  const tree = renderer
    .create(<GDCSelectMunicipality />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
