import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contextAuth';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faCheck, faExclamationTriangle, faTimes, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_SIZE, FONTS } from '../../assets/constants/constant';
import InputText from '../../components/TextInput';
import Footer from '../../components/Footer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';
// import Modal from 'react-native-modal';

interface ErrorState {
    visible: boolean;
    message: string;
    type: 'success' | 'error';
}

const PersonalInformation = () => {
    const { user, setUser } = useAuth(); // Move useAuth to top level
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState((user as any)?.profile?.first_name || '');
    const [lastName, setLastName] = useState((user as any)?.profile?.last_name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});
    const saveButtonOpacity = new Animated.Value(1);
    const [error, setError] = useState<ErrorState>({
        visible: false,
        message: '',
        type: 'error'
    });
    const [isGuestModal, setIsGuestModal] = useState(false);

    const dismissError = () => {
        setError(prev => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        if ((user as any)?.guest) {
            setIsGuestModal(true);
        }
    }, [user]);

    const AccessRestrictedModal = () => (
        <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalIconContainer}>
                        <FontAwesomeIcon icon={faLock} size={22} color={COLORS.alert} />
                    </View>
                    <Text style={styles.modalTitle}>Access Restricted</Text>
                </View>
                
                <Text style={styles.modalDescription}>
                    You need to sign in to access and manage your personal information.
                </Text>

                <View style={styles.modalActions}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setIsGuestModal(false);
                            navigation.goBack();
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => {
                            setIsGuestModal(false);
                            navigation.navigate('Login' as never);
                        }}
                    >
                        <FontAwesomeIcon 
                            icon={faArrowRight} 
                            size={16} 
                            color={COLORS.white}
                        />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Validate form before saving
    const validateForm = () => {
        const newErrors: { firstName?: string; lastName?: string } = {};
        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
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
                setError({
                    visible: true,
                    message: 'Your session has expired. Please log in again.',
                    type: 'error'
                });
                return;
            }

            // Make API request to update profile
            const response = await axios.patch(
                `${BASE_URL}/auth/profile/update`,
                {
                    first_name: firstName,
                    last_name: lastName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Profile update response:', response.data);

            // Update the user profile in context to reflect changes immediately
            setUser((prev: any) => ({
                ...prev,
                profile: {
                    ...prev?.profile,
                    first_name: firstName,
                    last_name: lastName,
                },
            }));

            setError({
                visible: true,
                message: 'Your personal information has been updated successfully',
                type: 'success'
            });

            // Delay navigation to show success message
            setTimeout(() => {
                navigation.goBack();
            }, 1500);

        } catch (error: any) {
            console.error('Failed to save personal information:', error);
            let errorMessage = 'Failed to update your information. Please try again.';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
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
        return (
            firstName.trim() !== ((user as any)?.profile?.first_name || '') ||
            lastName.trim() !== ((user as any)?.profile?.last_name || '')
        );
    }, [firstName, lastName, user]);

    // Prevent rendering for guest users
    if ((user as any)?.guest) {
        return <AccessRestrictedModal />;
    }

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
                    <Text style={styles.headerTitle}>Personal Information</Text>
                    <Text style={styles.headerSubtitle}>Manage your personal details</Text>
                </View>
            </View>

            {/* Add Error Banner */}
            {error.visible && (
                <View style={[
                    styles.errorContainer,
                    error.type === 'success' ? styles.successBanner : styles.errorBanner
                ]}>
                    <View style={styles.errorContent}>
                        <FontAwesomeIcon
                            icon={error.type === 'success' ? faCheck : faExclamationTriangle}
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
                        <Text style={styles.sectionTitle}>Basic Info</Text>
                        <Text style={styles.sectionDescription}>Update your personal details below</Text>

                        <View style={styles.inputGroup}>
                            <InputText
                                labelName="First Name"
                                placeholder="Enter your first name"
                                placeholderTextColor={COLORS.gray}
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text);
                                    setErrors(prev => ({ ...prev, firstName: undefined }));
                                }}
                                error={!!errors.firstName}
                                errorText={errors.firstName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <InputText
                                labelName="Last Name"
                                placeholder="Enter your last name"
                                placeholderTextColor={COLORS.gray}
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text);
                                    setErrors(prev => ({ ...prev, lastName: undefined }));
                                }}
                                error={!!errors.lastName}
                                errorText={errors.lastName}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View>
                    <Footer />
                </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
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
        margin:10,
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    errorBanner: {
        backgroundColor: '#f44336',
    },
    successBanner: {
        backgroundColor: '#4caf50',
    },
    errorContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorIcon: {
        marginRight: 10,
    },
    errorText: {
        color: 'white',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.medium,
        flex: 1,
    },
    errorDismiss: {
        padding: 6,
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
});

export default PersonalInformation;




