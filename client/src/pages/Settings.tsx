import React, { useEffect, useState } from 'react';
import styles from '../assets/style/settingStyle';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Modal
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faBell,
    faLanguage,
    faUser,
    faShield,
    faInfoCircle,
    faLock,
    faEnvelope,
    faImage,
    faCreditCard,
    faQuestionCircle,
    faRunning
} from '@fortawesome/free-solid-svg-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contextAuth.tsx';

// Type guard to check if user is GuestUser
const isGuestUser = (user: any): user is { guest: boolean } => {
    return user && 'guest' in user;
};

const LogoutModal = ({ modalVisible, setModalVisible, logoutUser }) => {
    return (
        <Modal transparent={true} visible={modalVisible} animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Are you sure you want to logout?</Text>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const SettingsScreen: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [modalVisible, setModalVisible] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");
            // Only navigate to Login if no token AND not in guest mode
            if (!token && !isGuestUser(user)) {
                navigation.navigate("Login");
            }
        };
        checkAuth();
    }, [user]);

    const SettingItem = ({
        icon,
        title,
        subtitle,
        rightComponent
    }: {
        icon: any,
        title: string,
        subtitle?: string,
        rightComponent?: React.ReactNode
    }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
                <FontAwesomeIcon icon={icon} size={20} color="#ffa726" />
                <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightComponent}
        </View>
    );

    const logout_user = async () => {
        await AsyncStorage.removeItem("token");
        navigation.navigate("Login");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Settings</Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.settingsSection}>
                    <SettingItem
                        icon={faUser}
                        title="Account Details"
                        subtitle="Manage personal information"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                        }
                    />
                    <SettingItem
                        icon={faEnvelope}
                        title="Email Preferences"
                        subtitle="Manage email notifications"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Manage</Text>
                            </TouchableOpacity>
                        }
                    />
                    <SettingItem
                        icon={faBell}
                        title="App Notifications"
                        subtitle="Manage app alert settings"
                        rightComponent={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#767577', true: '#ffa726' }}
                            />
                        }
                    />
                    <SettingItem
                        icon={faLanguage}
                        title="Language"
                        subtitle="English (United States)"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Change</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>

                <View style={styles.settingsSection}>
                    <SettingItem
                        icon={faShield}
                        title="Privacy & Security"
                        subtitle="Manage data and account security"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Manage</Text>
                            </TouchableOpacity>
                        }
                    />
                    <SettingItem
                        icon={faLock}
                        title="Change Password"
                        subtitle="Update your account password"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Change</Text>
                            </TouchableOpacity>
                        }
                    />
                    <SettingItem
                        icon={faRunning}
                        title="Logout"
                        subtitle="Logout to this Account"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
                                <Text style={styles.actionButtonText}>Logout</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>

                <View style={styles.settingsSection}>
                    <SettingItem
                        icon={faQuestionCircle}
                        title="Help & Support"
                        subtitle="Get assistance and contact support"
                        rightComponent={
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>Contact</Text>
                            </TouchableOpacity>
                        }
                    />
                    <SettingItem
                        icon={faInfoCircle}
                        title="About App"
                        subtitle="App version 1.0.0"
                    />
                </View>
            </ScrollView>
            <LogoutModal modalVisible={modalVisible} setModalVisible={setModalVisible} logoutUser={logout_user} />
        </View>
    );
};

export default SettingsScreen;