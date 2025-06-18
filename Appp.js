import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Stacknavigator from './navigators/stacknavigator';
import { navigationRef } from './navigators/rootnavigation';

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stacknavigator />
    </NavigationContainer>
  );
};

export default App;
