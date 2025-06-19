// navigators/stacknavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../src/WelcomeScreen';
import DrawerNavigator from './DrawerNavigator';
import FetchScreen from '../src/FetchScreen';


const Stack = createNativeStackNavigator();

const Stacknavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
        <Stack.Screen name="FetchScreen" component={FetchScreen} />
    </Stack.Navigator>
  );
};

export default Stacknavigator;
