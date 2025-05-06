import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { useNavigation, ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import styles from '../assets/style/signupStyle';
import { COLORS } from "../assets/constants/constant";
import InputText from "../components/TextInput";
import { faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BASE_URL } from "../config/config";
import LinearGradient from "react-native-linear-gradient";
import Footer from "../components/Footer";
import FloatingARElement from "../components/Floatingelements";
import SpinningCubeLoader from "../components/SpinningCubeLoader";

const { width, height } = Dimensions.get('window');

type FloatingElement = {
  type: string;
  initialPosition: {
    x: number;
    y: number;
  };
};

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    verificationCode?: string;
    terms?: string;
  }>({});
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [containerSize, setContainerSize] = useState({ width: width, height: 200 });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const apiURL = `${BASE_URL}/auth/register`;
  const verifyURL = `${BASE_URL}/auth/verify-email`;

  // Validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
  const nameRegex = /^[A-Za-z\s]+$/; // Letters and spaces only

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    // Validate firstName
    if (!firstName.trim()) {
      newErrors.firstName = "First Name is required";
    } else if (!nameRegex.test(firstName)) {
      newErrors.firstName = "First Name should only contain letters and spaces";
    }

    // Validate lastName
    if (!lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    } else if (!nameRegex.test(lastName)) {
      newErrors.lastName = "Last Name should only contain letters and spaces";
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Validate confirmPassword
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      newErrors.terms = "You must accept the Terms and Conditions to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSignup = async () => {
    console.log("handleSignup from Signup.tsx");
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);
    try {
      console.log("Sending request to: ", apiURL);
      console.log("Request Payload: ", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      });
      const response = await axios.post(
        apiURL,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Success", "Please check your email for verification code.");
        setShowVerificationModal(true);
        // Clear any previous verification errors
        setErrors(prev => ({ ...prev, verificationCode: undefined }));
        setVerificationCode("");
      } else {
        console.log("Unsuccess", "Registration Unsuccessful!");
        throw new Error(
          response.data?.detail || "Unexpected error during registration."
        );
      }
    } catch (error: any) {
      console.log("Signup Error:", error);
      if (error.response) {
        const errorMessage =
          error.response?.data?.detail || "Error during registration";
        console.log("Error", errorMessage);
        
        // If the error is that the user already exists but is verified
        if (error.response.status === 400 && errorMessage.includes("already exists")) {
          setErrors(prev => ({ 
            ...prev, 
            email: "This email is already registered. Please log in instead." 
          }));
        } else {
          setErrors(prev => ({ ...prev, general: errorMessage }));
        }
      } else if (error.request) {
        console.log(
          "Error",
          "Network Error. Please check your internet connection."
        );
        setErrors(prev => ({ 
          ...prev, 
          general: "Network Error. Please check your internet connection." 
        }));
      } else {
        console.log("Error", `Unexpected error: ${error.message}`);
        setErrors(prev => ({ ...prev, general: `Unexpected error: ${error.message}` }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: "Verification code is required",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        verifyURL,
        {
          email: email,
          code: verificationCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Success", "Email verified successfully!");
        setShowVerificationModal(false);
        navigation.navigate("Login", { email });
      } else {
        throw new Error(
          response.data?.detail || "Unexpected error during verification."
        );
      }
    } catch (error: any) {
      console.log("Verification Error:", error);
      setVerificationAttempts(prev => prev + 1);
      
      if (error.response) {
        const errorMessage = error.response?.data?.detail || "Invalid verification code";
        setErrors((prev) => ({
          ...prev,
          verificationCode: errorMessage,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          verificationCode: "Network error. Please try again.",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/resend-verification`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setErrors({});
        setVerificationCode("");
        setVerificationAttempts(0);
        
        // Disable resend button for 60 seconds
        setResendDisabled(true);
        setResendCountdown(60);
        
        const countdownInterval = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setResendDisabled(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      console.log("Resend Error:", error);
      if (error.response) {
        setErrors((prev) => ({
          ...prev,
          general: error.response?.data?.detail || "Failed to resend verification code",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Network error. Please try again.",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToTerms = () => {
    navigation.navigate("TermsAndConditions");
  };

  const navigateToPrivacy = () => {
    navigation.navigate("PrivacyPolicy");
  };

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      const newElements: FloatingElement[] = [
        { type: 'eye', initialPosition: { x: -containerSize.width * 0.6, y: -containerSize.height * 0.6 } },
        { type: 'wave', initialPosition: { x: containerSize.width * 0.6, y: -containerSize.height * 0.6 } },
        { type: 'box', initialPosition: { x: 0, y: containerSize.height * 0.6 } },
        { type: 'hologram', initialPosition: { x: -containerSize.width * 0.6, y: containerSize.height * 0.6 } },
        { type: 'palm', initialPosition: { x: containerSize.width * 0.6, y: containerSize.height * 0.6 } },
        { type: 'star', initialPosition: { x: -containerSize.width * 0.6, y: 0 } },
        { type: 'eye', initialPosition: { x: containerSize.width * 0.6, y: 0 } },
      ];
      setFloatingElements(newElements);
    }
  }, [containerSize]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <SpinningCubeLoader size={25} color={COLORS.primary} />
          </View>
        )}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#6B48FF', '#8E2DE2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  color={COLORS.white}
                  size={25}
                />
              </TouchableOpacity>
              {floatingElements.map((element, index) => (
                <FloatingARElement
                  key={index}
                  type={element.type}
                  initialPosition={element.initialPosition}
                  containerSize={containerSize}
                />
              ))}
              <Text style={styles.text}>Sign up</Text>
              <Text style={styles.subText}>
                & Discover the hidden gems of La Union!
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.formContainer}>
            <InputText
              labelName="First Name"
              placeholder="e.g. Juan"
              placeholderTextColor={COLORS.gray}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors((prev) => ({ ...prev, firstName: undefined }));
              }}
              error={!!errors.firstName}
              errorText={errors.firstName}
            />
            <InputText
              labelName="Last Name"
              placeholder="e.g. Dela Cruz"
              placeholderTextColor={COLORS.gray}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors((prev) => ({ ...prev, lastName: undefined }));
              }}
              error={!!errors.lastName}
              errorText={errors.lastName}
            />
            <InputText
              labelName="Email"
              placeholder="example@gmail.com"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={!!errors.email}
              errorText={errors.email}
            />
            <InputText
              labelName="Password"
              placeholder="Set Password"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              secureTextEntry
              error={!!errors.password}
              errorText={errors.password}
            />
            <InputText
              labelName="Confirm Password"
              placeholder="Re-enter password"
              placeholderTextColor={COLORS.gray}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry
              error={!!errors.confirmPassword}
              errorText={errors.confirmPassword}
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                  setErrors(prev => ({ ...prev, terms: undefined }));
                }}
              >
                <View style={[
                  styles.checkbox, 
                  termsAccepted ? styles.checkboxChecked : {}
                ]}>
                  {termsAccepted && (
                    <FontAwesomeIcon icon={faCheck} size={12} color={COLORS.white} />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink} onPress={navigateToTerms}>
                      Terms and Conditions
                    </Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink} onPress={navigateToPrivacy}>
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={styles.termsError}>{errors.terms}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton, 
                (isLoading || !termsAccepted) && styles.signupButtonDisabled
              ]}
              onPress={handleSignup}
              disabled={isLoading || !termsAccepted}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLinkText}>Login</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerContainer}>
              <Footer />
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showVerificationModal}
          onRequestClose={() => setShowVerificationModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.verificationModalTitle}>Email Verification</Text>
              <Text style={styles.verificationModalText}>
                Please enter the verification code sent to your email.
              </Text>
              
              <InputText
                labelName="Verification Code"
                placeholder="Enter verification code..."
                placeholderTextColor={COLORS.gray}
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text);
                  setErrors((prev) => ({ ...prev, verificationCode: undefined }));
                }}
                error={!!errors.verificationCode}
                errorText={errors.verificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              
              {errors.verificationCode && (
                <Text style={styles.verificationErrorText}>{errors.verificationCode}</Text>
              )}

              <View style={styles.verificationButtonRow}>
                <TouchableOpacity 
                  style={[styles.verificationButton, styles.verifyButton]} 
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                >
                  <Text style={styles.verificationButtonText}>
                    {isLoading ? "Verifying..." : "Verify"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.verificationButton, 
                    styles.resendButton,
                    resendDisabled && styles.disabledButton
                  ]}
                  onPress={handleResendCode}
                  disabled={resendDisabled || isLoading}
                >
                  <Text style={styles.verificationButtonText}>
                    {resendDisabled 
                      ? `Resend (${resendCountdown}s)` 
                      : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.verificationButton, styles.cancelVerificationButton]} 
                onPress={() => setShowVerificationModal(false)}
              >
                <Text style={[styles.verificationButtonText, { color: COLORS.gray }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
