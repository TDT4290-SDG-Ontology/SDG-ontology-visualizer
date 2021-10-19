import React from 'react';
import renderer from 'react-test-renderer';

import GDCSunburst from '../../../components/atoms/GDCSunburst';

import { gdcOutput as trdOutput } from '../../gdcData/no.5001-2020-no.5001';
import { gdcOutput as nlOutput } from '../../gdcData/nl.0772-2020-nl.0772';

it('renders expected output with legend', () => {
  const tree = renderer
    .create(<GDCSunburst municipality="Trondheim" gdc={trdOutput} showLegend />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders expected output without legend', () => {
  const tree = renderer.create(<GDCSunburst municipality="Trondheim" gdc={trdOutput} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders expected output for different municipality', () => {
  const tree = renderer.create(<GDCSunburst municipality="Eindhoven" gdc={nlOutput} />).toJSON();
  expect(tree).toMatchSnapshot();
});
