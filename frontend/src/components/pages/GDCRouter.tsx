import React from 'react';
import { Box } from '@chakra-ui/react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import GDCSelectMunicipality from './GDCSelectMunicipality';
import GDCViewMunicipality from './GDCViewMunicipality';

const GDCRouter: React.FC = () => (
  <Router>
    <Box flex="1">
      <Switch>
        <Route exact path="" component={GDCSelectMunicipality} />
        <Route exact path="view/:municipality" component={GDCViewMunicipality} />
      </Switch>
    </Box>
  </Router>
);

export default GDCRouter;
