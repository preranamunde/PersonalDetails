// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './navigators/DrawerNavigator';



const Appp = () => {
  return (
    <NavigationContainer>
     <DrawerNavigator/>
    </NavigationContainer>
  );
};

export default Appp;
