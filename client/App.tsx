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
import ForgotPassword from './src/pages/ForgotPassword';
import AuthProvider, { useAuth } from './contextAuth';
import StoreDetails from './src/pages/StoreDetails';
import { ActivityIndicator, View } from 'react-native';
import ReviewScreen from './src/pages/Reviews';
import MunicipalityDetail from './src/pages/MunicipalityDetail';
import PriceComparison from './src/pages/PriceComparison';
import EditProfileScreen from './src/pages/EditProfile';
// Import the new settings screens
import PersonalInformation from './src/pages/settings/PersonalInformation';
import PasswordSettings from './src/pages/settings/PasswordSettings';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  const initialRoute = user ? 'Tabs' : 'Welcome';
  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenListeners={{
        state: (e) => {
        }
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
      <Stack.Screen name="Reviews" component={ReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StoreDetails" component={StoreDetails} options={{ headerShown: false }} />
      <Stack.Screen name="MunicipalityDetail" component={MunicipalityDetail} options={{ headerShown: false }} />
      <Stack.Screen name="PriceComparison" component={PriceComparison} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />

      <Stack.Screen 
        name="PersonalInformation" 
        component={PersonalInformation} 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="PasswordSettings" 
        component={PasswordSettings}
        options={{
          headerShown: false
        }}
      />
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
