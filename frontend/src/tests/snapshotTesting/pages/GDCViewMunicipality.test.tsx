import React from 'react';
import renderer from 'react-test-renderer';
import { Route, MemoryRouter } from 'react-router-dom';

import GDCViewMunicipality from '../../../components/pages/GDCViewMunicipality';

it('renders when there are no items', () => {
  const tree = renderer
    .create(
      <MemoryRouter initialEntries={['gdc/view/no.5001']}>
        <Route path="gdc/view/:municipality">
          <GDCViewMunicipality />
        </Route>
      </MemoryRouter>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
