import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useAuth } from '../../contextAuth.tsx';
import styles from '../assets/style/settingStyle';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  
  // Initial state with user data or defaults
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Add profile image handling if needed (e.g., image picker)

  const handleSave = () => {
    // Implement save logic (e.g., API call to update profile)
    console.log('Saving profile:', { name, email });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 20 }} /> {/* Spacer for alignment */}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {/* Profile Image */}
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Image
              source={
                user?.profile_image
                  ? { uri: user.profile_image }
                  : require('../assets/img/default_avatar.png')
              }
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => {
                // Implement image picker logic
                console.log('Change profile image');
              }}
            >
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.settingTitle}>Name</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D1D6',
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginTop: 8,
              }}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.settingTitle}>Email</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D1D6',
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                marginTop: 8,
              }}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={handleSave}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;