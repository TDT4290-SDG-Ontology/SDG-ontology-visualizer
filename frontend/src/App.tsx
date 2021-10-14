import React from 'react';
import { Provider } from 'react-redux';
import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import store from './state/store';
import ErrorModal from './components/atoms/ErrorModal';
import Navbar from './components/atoms/Navbar';
import Footer from './components/atoms/Footer';
import Frontpage from './components/pages/Frontpage';
import About from './components/pages/About';
import OntologyPage from './components/pages/OntologyPage';
import NotFoundPage from './components/pages/NotFound';

import GDCSelectMunicipality from './components/pages/GDCSelectMunicipality';
import GDCViewMunicipality from './components/pages/GDCViewMunicipality';

const App: React.FC = () => (
  <ChakraProvider>
    <Provider store={store}>
      <Flex
        bg="gray.50"
        m={0}
        minHeight="100vh"
        direction="column"
        overflow="hidden"
        color="gray.800"
      >
        <Router>
          <ErrorModal />
          <Navbar />
          <Box flex="1">
            <Switch>
              <Route path="/" exact component={Frontpage} />
              <Route path="/ontology" exact component={OntologyPage} />
              <Route path="/about" exact component={About} />
              <Route exact path="/gdc/view/:municipality" component={GDCViewMunicipality} />
              <Route exact path="/gdc" component={GDCSelectMunicipality} />
              <Route component={NotFoundPage} />
            </Switch>
          </Box>
          <Footer />
        </Router>
      </Flex>
    </Provider>
  </ChakraProvider>
);

export default App;
