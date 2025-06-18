import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Details from '../Details';
import FetchScreen from '../FetchScreen';

const Stack = createNativeStackNavigator();

const Stacknavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Details">
      <Stack.Screen name="Details" component={Details} options={{ headerShown: false }} />
      <Stack.Screen name="FetchScreen" component={FetchScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default Stacknavigator;
