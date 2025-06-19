import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import WelcomeScreen from '../src/WelcomeScreen';
import PersonalDetails from '../src/PersonalDetails'
import FetchScreen from '../src/FetchScreen';



const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Welcome"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#1976D2' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Welcome" component={WelcomeScreen} />
      <Drawer.Screen name="PersonalDetails" component={PersonalDetails} />
      <Drawer.Screen name="Fetch Personal Details" component={FetchScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
