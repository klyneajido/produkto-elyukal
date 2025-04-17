import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../assets/style/settingStyle';

const PasswordSettings: React.FC = () => {
    const navigation = useNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        try {
            if (newPassword !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            // Implement API call to change password
            console.log('Changing password');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to change password:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Change Password</Text>
            </View>

            <ScrollView style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Current Password</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="Enter current password"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="Enter new password"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Confirm new password"
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleChangePassword}
                >
                    <Text style={styles.saveButtonText}>Change Password</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PasswordSettings;