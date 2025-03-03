import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS} from "../constants/constant";

const screenWidth = Dimensions.get("window").width;
const loginSignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },
  bgImg: {
    height: 200,
    width: screenWidth,
    padding: 15,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 35,
    marginLeft: 15,
    marginTop: 30,
    color: COLORS.white,
  },
  subText: {
    marginLeft: 15,
    fontFamily: FONTS.regular,
    color: COLORS.lightgray,
  },

  appTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color:  COLORS.black,
    marginTop: 15,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
      marginHorizontal: 15,
  },
  forgotPasswordText: {
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 15,
  },

  continueGuestButton: {
    backgroundColor: COLORS.white, 
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2, 
    borderColor: COLORS.secondary,
    marginHorizontal: 15,
  },
  loginButtonText: {
    fontFamily: FONTS.regular,
    color: COLORS.white,
    fontSize: 16,
  },
  // New text style for Continue as Guest button
  continueGuestButtonText: {
    fontFamily: FONTS.semibold,
    color: COLORS.secondary, 
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    fontFamily: FONTS.semibold,
    color: COLORS.white,
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontFamily: FONTS.regular,
    color: COLORS.lightgray,
  },
  loginText: {
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  signupLinkText: {
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
  },
  loginLinkText: {
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
  },
  errorContainer: {
    backgroundColor: "rgba(255,0,0,0.1)",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "red",
  },
  errorText: {
    color: "red",
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
});

export default loginSignupStyles;