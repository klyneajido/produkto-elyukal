import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
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
import AuthProvider, { useAuth } from './contextAuth';
import EventDetails from './src/pages/EventDetails';
import StoreDetails  from './src/pages/StoreDetails';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Ensure we avoid flickers on initial auth check
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={user ? 'Tabs' : 'Welcome'}>
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetails} options={{ headerShown: false }} />
      <Stack.Screen name="TestEnv" component={TestEnv} options={{ headerShown: false }} />
      <Stack.Screen name="StoreDetails" component={StoreDetails}  options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
