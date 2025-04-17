import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    TouchableOpacity,
    ScrollView,
    Modal,
    StatusBar,
    Image,
    SafeAreaView,
    Platform,
    Animated,
    Pressable
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
    faQuestionCircle,
    faRightFromBracket,
    faChevronRight,
    faMoon,
    faGlobe,
    faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contextAuth.tsx';
import styles from '../assets/style/settingStyle';
import { COLORS } from '../assets/constants/constant.ts';
import Footer from '../components/Footer.tsx';

// Type guard to check if user is GuestUser
const isGuestUser = (user: any): user is { guest: boolean } => {
    return user && 'guest' in user;
};

interface SettingItemProps {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showDivider?: boolean;
}

const SettingsScreen: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const [profileAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");
            // Only navigate to Login if no token AND not in guest mode
            if (!token && !isGuestUser(user)) {
                navigation.navigate("Login");
            }
        };
        checkAuth();

        // Animate profile section on load
        Animated.timing(profileAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [user]);

    const logoutUser = async () => {
        await AsyncStorage.removeItem("token");
        setLogoutModalVisible(false);
        navigation.navigate("Login");
    };

    const SettingItem: React.FC<SettingItemProps> = ({
        icon,
        title,
        subtitle,
        onPress,
        rightComponent,
        showDivider = true
    }) => (
        <>
            <TouchableOpacity
                style={styles.settingItem}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.settingItemLeft}>
                    <View style={styles.iconContainer}>
                        <FontAwesomeIcon icon={icon} size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                        <Text style={styles.settingTitle}>{title}</Text>
                        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                    </View>
                </View>
                {rightComponent || (
                    <FontAwesomeIcon icon={faChevronRight} size={14} color="#A0A0A0" />
                )}
            </TouchableOpacity>
            {showDivider && <View style={styles.divider} />}
        </>
    );

    const LogoutModal = () => (
        <Modal
            transparent={true}
            visible={logoutModalVisible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalIconContainer}>
                        <FontAwesomeIcon icon={faRightFromBracket} size={28} color="#FF6347" />
                    </View>
                    <Text style={styles.modalTitle}>Sign Out</Text>
                    <Text style={styles.modalDescription}>
                        Are you sure you want to sign out of your account?
                    </Text>
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setLogoutModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={logoutUser}
                        >
                            <Text style={styles.logoutButtonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // User profile section with animation
    const ProfileSection = () => {
        const userImage = user?.profile_image || require('../assets/img/default_avatar.png');
        const userName = user?.first_name ? `${user.first_name} ${user.last_name}` : (isGuestUser(user) ? 'Guest User' : 'User');
        const userEmail = user?.email || (isGuestUser(user) ? '' : 'user@example.com');

        return (
            <Animated.View
                style={[
                    styles.profileSection,
                    {
                        opacity: profileAnimation,
                        transform: [{
                            translateY: profileAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}
            >
                <View style={styles.profileContent}>
                    <Image
                        source={typeof userImage === 'string' ? { uri: userImage } : userImage}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userName}</Text>
                        {userEmail && <Text style={styles.profileEmail}>{userEmail}</Text>}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editProfileButton}
                   
                >
                    <Text style={styles.editProfileText}>Edit</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Set things how you like.</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <ProfileSection />

                {/* Account Settings */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <SettingItem
                        icon={faUser}
                        title="Personal Information"
                        subtitle="Manage your personal details"
                       
                    />

                    <SettingItem
                        icon={faEnvelope}
                        title="Communication Preferences"
                        subtitle="Manage email notifications and updates"
                    
                    />

                    <SettingItem
                        icon={faShield}
                        title="Privacy & Security"
                        subtitle="Manage data and account security"
                    
                    />

                    <SettingItem
                        icon={faLock}
                        title="Password"
                        subtitle="Update your account password"
                    
                        showDivider={false}
                    />
                </View>

                {/* App Settings */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <SettingItem
                        icon={faBell}
                        title="Notifications"
                        subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
                        rightComponent={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#D1D1D6"
                                style={styles.switch}
                            />
                        }
                    />

                    <SettingItem
                        icon={faMoon}
                        title="Dark Mode"
                        subtitle={darkModeEnabled ? "Enabled" : "Disabled"}
                        rightComponent={
                            <Switch
                                value={darkModeEnabled}
                                onValueChange={setDarkModeEnabled}
                                trackColor={{ false: '#D1D1D6', true: '#4CD964' }}
                                thumbColor="#FFFFFF"
                                ios_backgroundColor="#D1D1D6"
                                style={styles.switch}
                            />
                        }
                    />

                    <SettingItem
                        icon={faLanguage}
                        title="Language"
                        subtitle="English (United States)"
                        
                    />

                    <SettingItem
                        icon={faGlobe}
                        title="Region"
                        subtitle="La union"
                        showDivider={false}
                    />
                </View>

                {/* About & Legal */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <SettingItem
                        icon={faInfoCircle}
                        title="About App"
                        subtitle="Version: Beta"
                        showDivider={false}
                    />
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={() => setLogoutModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Footer />
                    <View style={styles.footerLinks}>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerDot}>•</Text>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Terms of Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <LogoutModal />
        </SafeAreaView>
    );
};

export default SettingsScreen;