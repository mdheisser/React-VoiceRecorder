import {createStackNavigator} from "react-navigation";
import Recorder from '../screens/Recorder';
import Dashboard from "../screens/Dashboard";

export const AppNavigator = createStackNavigator({

  Dashboard: {
    screen: Dashboard,
  },
  Recorder: {
    screen: Recorder
  },
});
