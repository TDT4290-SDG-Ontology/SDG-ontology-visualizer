import React from 'react';
import renderer from 'react-test-renderer';

import GDCPanel from '../../../components/molecules/GDCPanel';

import { gdcOutput as trdOutput } from '../../gdcData/no.5001-2020-no.5001';
import { gdcOutput as nlOutput } from '../../gdcData/nl.0772-2020-nl.0772';
import { gdcOutput as nl2Output } from '../../gdcData/nl.0772-2020-no.5001';

it('renders expected output for single municipality', () => {
  const tree = renderer
    .create(
      <GDCPanel
        year={2020}
        municipality="Trondheim"
        data={trdOutput.indicators.get('EN: EN: AQ: 2C')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders expected output for comparison of municipalities', () => {
  const tree = renderer
    .create(
      <GDCPanel
        year={2020}
        municipality="Trondheim"
        data={trdOutput.indicators.get('EN: EN: AQ: 2C')}
        compareMunicipality="Eindhoven"
        compareData={nlOutput.indicators.get('EN: EN: AQ: 2C')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders expected output for comparison of municipalities with override', () => {
  const tree = renderer
    .create(
      <GDCPanel
        year={2020}
        municipality="Trondheim"
        data={trdOutput.indicators.get('EN: EN: AQ: 2C')}
        compareMunicipality="Eindhoven"
        compareData={nl2Output.indicators.get('EN: EN: AQ: 2C')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// TODO: also test for combinations with indicator without goal.
