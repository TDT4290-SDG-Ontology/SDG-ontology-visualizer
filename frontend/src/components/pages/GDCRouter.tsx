import React from 'react';
import { Box } from '@chakra-ui/react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import GDCSelectMunicipality from './GDCSelectMunicipality';
import GDCViewMunicipality from './GDCViewMunicipality';

const GDCRouter: React.FC = () => (
  <Router>
    <Box flex="1">
      <Switch>
        <Route path="" exact component={GDCSelectMunicipality} />
        <Route path="view/:municipality" exact component={GDCViewMunicipality} />
      </Switch>
    </Box>
  </Router>
);

export default GDCRouter;
