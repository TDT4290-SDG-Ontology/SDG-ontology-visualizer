import React from 'react';
import renderer from 'react-test-renderer';

import GDCView from '../../../components/molecules/GDCView';
import store from '../../../state/store';

it('renders when there are no items', () => {
  const tree = renderer
    .create(<GDCView municipality="Trondheim" municipalityCode="no.5001" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
