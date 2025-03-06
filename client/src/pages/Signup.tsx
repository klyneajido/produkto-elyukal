import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import styles from "../assets/style/signupStyle";
import { COLORS } from "../assets/constants/constant";
import InputText from "../components/TextInput";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { BASE_URL } from "../config/config";

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const apiURL = `${BASE_URL}/auth/register`;

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
        Alert.alert("Success", "Registration Successful!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Unsuccess", "Registration Unsuccessful!");
        throw new Error(
          response.data?.detail || "Unexpected error during registration."
        );
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error.response) {
        const errorMessage =
          error.response?.data?.detail || "Error during registration";
        Alert.alert("Error", errorMessage);
      } else if (error.request) {
        Alert.alert(
          "Error",
          "Network Error. Please check your internet connection."
        );
      } else {
        Alert.alert("Error", `Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <ImageBackground
              source={require("../assets/img/signup_logo.png")}
              resizeMode="cover"
              style={styles.bgImg}
            >
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  color={COLORS.white}
                  size={25}
                />
              </TouchableOpacity>
              <Text style={styles.text}>Sign up</Text>
              <Text style={styles.subText}>
                & discover the hidden gems of La Union!
              </Text>
            </ImageBackground>
          </View>

          <View style={styles.formContainer}>
            <InputText
              labelName="First Name"
              placeholder="Enter first name..."
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
              placeholder="Enter last name..."
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
              placeholder="Enter email..."
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
              placeholder="Password"
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

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;