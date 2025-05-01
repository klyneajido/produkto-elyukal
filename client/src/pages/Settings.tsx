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

// Add these interfaces at the top of the file
interface UserProfile {
    profile: {
        email: string;
        first_name: string;
        last_name: string;
        profile_image?: string;
    };
    user_metadata?: {
        name: string;
    };
}

// Update the type guard with debugging
const isGuestUser = (user: any): user is { guest: boolean } => {
    console.log('🔍 Checking if guest user:', user);
    const result = user && 'guest' in user;
    console.log('📊 Is guest user:', result);
    return result;
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
    const [googleAccountModalVisible, setGoogleAccountModalVisible] = useState(false);
    const [guestAccountModalVisible, setGuestAccountModalVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const [profileAnimation] = useState(new Animated.Value(0));

    // Add this to check if user is Google-authenticated
    const isGoogleUser = React.useMemo(() => {
        return (user as any)?.app_metadata?.provider === 'google';
    }, [user]);

    // Add debug logging for component mount and user state
    useEffect(() => {
        console.log('🔄 Settings Screen Mounted');
        console.log('👤 Current User State:', user);

        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");
            console.log('🎫 Auth Token:', token ? 'Present' : 'Not found');
            
            if (!token && !isGuestUser(user)) {
                console.log('⚠️ No token and not guest - redirecting to Login');
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

        return () => {
            console.log('♻️ Settings Screen Unmounted');
        };
    }, [user]);

    const logoutUser = async () => {
        console.log('🚪 Logout initiated');
        try {
            await AsyncStorage.removeItem("token");
            console.log('🗑️ Token removed from AsyncStorage');
            setLogoutModalVisible(false);
            navigation.navigate("Login");
        } catch (error) {
            console.log('❌ Logout error:', error);
        }
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
            <Animated.View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIconContainer}>
                            <FontAwesomeIcon icon={faRightFromBracket} size={22} color={COLORS.alert} />
                        </View>
                        <Text style={styles.modalTitle}>Sign Out</Text>
                    </View>
                    
                    <Text style={styles.modalDescription}>
                        You'll need to sign in again to access your account.
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
                            <FontAwesomeIcon 
                                icon={faRightFromBracket} 
                                size={16} 
                                color={COLORS.white}
                                style={styles.logoutButtonIcon}
                            />
                            <Text style={styles.logoutButtonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );

    // Add Google Account Modal
    const GoogleAccountModal = () => (
        <Modal
            transparent={true}
            visible={googleAccountModalVisible}
            animationType="fade"
            statusBarTranslucent
        >
            <Animated.View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIconContainer}>
                            <FontAwesomeIcon icon={faLock} size={22} color={COLORS.alert} />
                        </View>
                        <Text style={styles.modalTitle}>Google Account</Text>
                    </View>
                    
                    <Text style={styles.modalDescription}>
                        Your profile information is managed by your Google account. To change your name or password, please update it in your Google account settings.
                    </Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setGoogleAccountModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );

    // Add Guest Account Modal
    const GuestAccountModal = () => (
        <Modal
            transparent={true}
            visible={guestAccountModalVisible}
            animationType="fade"
            statusBarTranslucent
        >
            <Animated.View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIconContainer}>
                            <FontAwesomeIcon icon={faLock} size={22} color={COLORS.alert} />
                        </View>
                        <Text style={styles.modalTitle}>Access Restricted</Text>
                    </View>
                    
                    <Text style={styles.modalDescription}>
                        You need to sign in to access and manage your account settings.
                    </Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setGuestAccountModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={() => {
                                setGuestAccountModalVisible(false);
                                navigation.navigate("Login");
                            }}
                        >
                            <FontAwesomeIcon 
                                icon={faRightFromBracket} 
                                size={16} 
                                color={COLORS.white}
                                style={styles.logoutButtonIcon}
                            />
                            <Text style={styles.logoutButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );

    // Handle navigation to Personal Information
    const handlePersonalInfoPress = () => {
        if (isGuestUser(user)) {
            setGuestAccountModalVisible(true);
        } else if (isGoogleUser) {
            setGoogleAccountModalVisible(true);
        } else {
            navigation.navigate('PersonalInformation');
        }
    };

    // Handle navigation to Password Settings
    const handlePasswordPress = () => {
        if (isGuestUser(user)) {
            setGuestAccountModalVisible(true);
        } else if (isGoogleUser) {
            setGoogleAccountModalVisible(true);
        } else {
            navigation.navigate('PasswordSettings');
        }
    };

    // User profile section with animation
    const ProfileSection = () => {
        const defaultImage = require('../assets/img/avatartion.png');
        const userProfile = user as unknown as UserProfile;
        
        console.log('🖼️ Profile Section Rendering');
        console.log('📝 User Profile Data:', userProfile);
        
        const getUserName = () => {
            if (isGuestUser(user)) {
                console.log('👥 Rendering guest user name');
                return 'Guest User';
            }
            if (userProfile?.profile?.first_name && userProfile?.profile?.last_name) {
                const fullName = `${userProfile.profile.first_name} ${userProfile.profile.last_name}`;
                console.log('👤 Using full name:', fullName);
                return fullName;
            }
            const fallbackName = userProfile?.user_metadata?.name || 'User';
            console.log('👤 Using fallback name:', fallbackName);
            return fallbackName;
        };

        const getUserEmail = () => {
            if (isGuestUser(user)) {
                console.log('📧 No email for guest user');
                return '';
            }
            const email = userProfile?.profile?.email || '';
            console.log('📧 User email:', email);
            return email;
        };

        const getProfileImage = () => {
            if (userProfile?.profile?.profile_image) {
                console.log('🖼️ Using custom profile image:', userProfile.profile.profile_image);
                return { uri: userProfile.profile.profile_image };
            }
            console.log('🖼️ Using default profile image');
            return defaultImage;
        };

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
                        source={getProfileImage()}
                        style={styles.profileImage}
                        onError={(error) => {
                            console.log('❌ Profile image loading error:', error.nativeEvent.error);
                        }}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{getUserName()}</Text>
                        {getUserEmail() && <Text style={styles.profileEmail}>{getUserEmail()}</Text>}
                    </View>
                </View>
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
                        subtitle={isGoogleUser ? "Managed by Google" : "Manage your personal details"}
                        onPress={handlePersonalInfoPress}
                    />
                    <SettingItem
                        icon={faLock}
                        title="Password"
                        subtitle={isGoogleUser ? "Managed by Google" : "Update your account password"}
                        showDivider={false}
                        onPress={handlePasswordPress}
                    />
                </View>

                {/* App Settings */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
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

                {/* Sign Out/Sign In Button */}
                <TouchableOpacity
                    style={[styles.signOutButton, isGuestUser(user) && { backgroundColor: COLORS.primary }]}
                    onPress={() => isGuestUser(user) ? navigation.navigate('Login') : setLogoutModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.signOutText, 
                        isGuestUser(user) && { color: COLORS.white }
                    ]}>
                        {isGuestUser(user) ? "Sign In" : "Sign Out"}
                    </Text>
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
            <GoogleAccountModal />
            <GuestAccountModal />
        </SafeAreaView>
    );
};

export default SettingsScreen;
