import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/components/Theme';
import TabNavigator from './src/navigation/Tab';
import ProductDetails from './src/pages/ProductDetails';
import LoginScreen from './src/pages/Login';
import SignupScreen from './src/pages/Signup';
import Welcome from './src/pages/Welcome';
import TestEnv from './TestEnv';
import ForgotPassword from './src/pages/ForgotPassword';
import AuthProvider from './contextAuth';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetails}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
            <Stack.Screen
              name="Testenv"
              component={TestEnv}
              options={{ headerShown: false }}
            />{/* Remove spaces */}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;