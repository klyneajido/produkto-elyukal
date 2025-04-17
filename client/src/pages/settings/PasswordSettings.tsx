import React, { useState, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
    faChevronLeft, 
    faCheck, 
    faExclamationTriangle,
    faTimes,
    faLock,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_SIZE, FONTS } from '../../assets/constants/constant';
import InputText from '../../components/TextInput';
import Footer from '../../components/Footer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';
import { useAuth } from '../../../contextAuth';

interface ErrorState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
}

const GuestAccessModal = () => {
    const navigation = useNavigation();
    
    return (
        <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalIconContainer}>
                        <FontAwesomeIcon icon={faLock} size={22} color={COLORS.alert} />
                    </View>
                    <Text style={styles.modalTitle}>Access Restricted</Text>
                </View>
                
                <Text style={styles.modalDescription}>
                    You need to sign in to change your password settings.
                </Text>

                <View style={styles.modalActions}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login' as never)}
                    >
                        <FontAwesomeIcon 
                            icon={faArrowRight} 
                            size={16} 
                            color={COLORS.white}
                            style={styles.loginButtonIcon}
                        />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const PasswordSettings = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    // Add user check (assuming you have user context)
    if ((user as any)?.guest) {
        return <GuestAccessModal />;
    }

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ErrorState>({
        visible: false,
        message: '',
        type: 'error'
    });
    const [errors, setErrors] = useState<{ 
        currentPassword?: string; 
        newPassword?: string; 
        confirmPassword?: string 
    }>({});
    const saveButtonOpacity = new Animated.Value(1);

    const dismissError = () => {
        setError(prev => ({ ...prev, visible: false }));
    };

    // Validate form before saving
    const validateForm = () => {
        const newErrors: { 
            currentPassword?: string; 
            newPassword?: string; 
            confirmPassword?: string 
        } = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Password confirmation is required';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setError({
                visible: true,
                message: 'Please correct the errors in the form',
                type: 'error'
            });
            return;
        }

        try {
            setIsLoading(true);
            setError(prev => ({ ...prev, visible: false }));

            // Button press animation
            Animated.spring(saveButtonOpacity, {
                toValue: 0.7,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start(() => {
                Animated.spring(saveButtonOpacity, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }).start();
            });

            // Retrieve token from AsyncStorage
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Make API request to update password
            await axios.patch(
                `${BASE_URL}/auth/password/update`,
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setError({
                visible: true,
                message: 'Password updated successfully',
                type: 'success'
            });

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Navigate back after a short delay
            setTimeout(() => {
                navigation.goBack();
            }, 1500);

        } catch (error: any) {
            console.error('Failed to update password:', error);
            let errorMessage = 'Failed to update your password. Please try again.';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    errorMessage = 'Current password is incorrect';
                } else if (error.response?.status === 401) {
                    errorMessage = 'Your session has expired. Please log in again.';
                } else if (error.response?.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
            }

            setError({
                visible: true,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isFormChanged = useCallback(() => {
        return currentPassword.trim() !== '' || 
               newPassword.trim() !== '' || 
               confirmPassword.trim() !== '';
    }, [currentPassword, newPassword, confirmPassword]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color={isLoading ? COLORS.gray : COLORS.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Password Settings</Text>
                    <Text style={styles.headerSubtitle}>Update your account password</Text>
                </View>
            </View>

            {/* Error Banner */}
            {error.visible && (
                <View style={[
                    styles.errorContainer,
                    error.type === 'success' ? styles.successBanner : 
                    error.type === 'warning' ? styles.warningBanner : 
                    styles.errorBanner
                ]}>
                    <View style={styles.errorContent}>
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            size={18}
                            color="#FFF"
                            style={styles.errorIcon}
                        />
                        <Text style={styles.errorText}>{error.message}</Text>
                    </View>
                    <TouchableOpacity onPress={dismissError} style={styles.errorDismiss}>
                        <FontAwesomeIcon icon={faTimes} size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Change Password</Text>
                        <Text style={styles.sectionDescription}>Enter your current password and choose a new one</Text>

                        <View style={styles.inputGroup}>
                            <InputText
                                labelName="Current Password"
                                placeholder="Enter your current password"
                                placeholderTextColor={COLORS.gray}
                                value={currentPassword}
                                onChangeText={(text) => {
                                    setCurrentPassword(text);
                                    setErrors(prev => ({ ...prev, currentPassword: undefined }));
                                }}
                                error={!!errors.currentPassword}
                                errorText={errors.currentPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <InputText
                                labelName="New Password"
                                placeholder="Enter your new password"
                                placeholderTextColor={COLORS.gray}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    setErrors(prev => ({ ...prev, newPassword: undefined }));
                                }}
                                error={!!errors.newPassword}
                                errorText={errors.newPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <InputText
                                labelName="Confirm New Password"
                                placeholder="Confirm your new password"
                                placeholderTextColor={COLORS.gray}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                }}
                                error={!!errors.confirmPassword}
                                errorText={errors.confirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>
                    <Footer />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Animated.View style={{ opacity: saveButtonOpacity, width: '100%' }}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.saveButton,
                            (!isFormChanged() || isLoading) && styles.saveButtonDisabled,
                            pressed && styles.saveButtonPressed,
                        ]}
                        onPress={handleSave}
                        disabled={!isFormChanged() || isLoading}
                        android_ripple={{ color: '#3451B2', borderless: false }}
                        accessibilityLabel="Save changes"
                        accessibilityRole="button"
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheck} size={16} color={COLORS.white} style={styles.buttonIcon} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.container,
    },
    keyboardAvoidContainer: {
        flex: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.lightgray,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
    },
    errorBanner: {
        backgroundColor: '#DC2626',
    },
    successBanner: {
        backgroundColor: '#059669',
    },
    warningBanner: {
        backgroundColor: '#D97706',
    },
    errorContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorIcon: {
        marginRight: 8,
    },
    errorText: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.small,
        flex: 1,
    },
    errorDismiss: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    formSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.semibold,
        color: COLORS.black,
        marginBottom: 2,
    },
    sectionDescription: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 12,
    },
    footer: {
        backgroundColor: COLORS.white,
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightgray,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    saveButtonDisabled: {
        backgroundColor: COLORS.lightgray,
    },
    saveButtonPressed: {
        opacity: 0.9,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.semibold,
        marginLeft: 6,
    },
    buttonIcon: {
        marginRight: 6,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${COLORS.alert}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.semibold,
        color: COLORS.black,
    },
    modalDescription: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: COLORS.lightgray,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.black,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.medium,
    },
    loginButton: {
        flex: 1,
        flexDirection: 'row',
        padding: 12,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.medium,
        marginLeft: 8,
    },
    loginButtonIcon: {
        marginRight: 8,
    },
});

export default PasswordSettings;





