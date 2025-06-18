/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Appp from './Appp';

export { default as Details } from './Details';


AppRegistry.registerComponent(appName, () => Appp);
