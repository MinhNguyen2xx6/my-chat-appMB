/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App'; // Trỏ vào src/App.tsx thay vì ./App
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
