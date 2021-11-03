import React from 'react';
import { Provider } from 'react-redux';
import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import store from './state/store';

import CookieNotice from './components/atoms/CookieNotice';
import ErrorModal from './components/atoms/ErrorModal';
import Navbar from './components/atoms/Navbar';
import Footer from './components/atoms/Footer';

import Frontpage from './components/pages/Frontpage';
import About from './components/pages/About';
import OntologyPage from './components/pages/OntologyPage';
import NotFoundPage from './components/pages/NotFound';
import Login from './components/pages/Login';

import GDCSelectMunicipality from './components/pages/GDCSelectMunicipality';
import GDCViewMunicipality from './components/pages/GDCViewMunicipality';
import GDCCompareMunicipalities from './components/pages/GDCCompareMunicipalities';
import GDCDataEntry from './components/pages/GDCDataEntry';

const App: React.FC = () => {
  // Better to do this in a global scope so that it's easily visible!
  // Massive hack, please fix in future:
  //
  // The problem is that the accordions used to hide the plots in GDCView set the
  // height of the responsive container to 0, which causes the warning to issue.
  // This happens ~117 times per page render, causing a massive flood of warnings,
  // slowing down the page loading times. The ResponsiveContainer has minHeight
  // and minWidth props set, but does not seem to use them in size calculations.

  const originalWarn = console.warn.bind(console.warn);
  console.warn = (msg: any) => {
    if (!msg.toString().startsWith('The width(0) and height(0) of chart should be greater than 0'))
      originalWarn(msg);
  };

  return (
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
                <Route path="/login" exact component={Login} />
                <Route
                  exact
                  path="/gdc/compare/:municipality/:otherMunicipality"
                  component={GDCCompareMunicipalities}
                />
                <Route exact path="/gdc/view/:municipality" component={GDCViewMunicipality} />
                <Route exact path="/gdc/data" component={GDCDataEntry} />
                <Route exact path="/gdc" component={GDCSelectMunicipality} />
                <Route component={NotFoundPage} />
              </Switch>
            </Box>
            <Footer />
            <CookieNotice />
          </Router>
        </Flex>
      </Provider>
    </ChakraProvider>
  );
};

export default App;
