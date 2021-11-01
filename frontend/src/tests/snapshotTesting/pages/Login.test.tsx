import React from 'react';
import renderer from 'react-test-renderer';

import Login from '../../../components/pages/Login';

it('renders login page correctly', () => {
  const tree = renderer.create(<Login />).toJSON();
  expect(tree).toMatchSnapshot();
});
