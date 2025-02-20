import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS, FONT_SIZE, FONT_SIZES } from "../constants/constant";

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
    color: COLORS.gray,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appTitle: {
    fontFamily: "OpenSans-Bold",
    fontSize: 22,
    color: "#333",
    marginTop: 15,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    // backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: "OpenSans-Regular",
    color: "#333",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontFamily: "OpenSans-Regular",
    color: "#666",
  },
  loginButton: {
    backgroundColor: "#ffd700",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom:10,
  },
  continueGuest:{

  },
  signupButton: {
    backgroundColor: "#ffd700",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    fontFamily: "OpenSans-Semibold",
    color: "#fff",
    fontSize: 16,
  },
  signupButtonText: {
    fontFamily: "OpenSans-Semibold",
    color: "#fff",
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
    fontFamily: "OpenSans-Regular",
    color: "#666",
  },
  loginText: {
    fontFamily: "OpenSans-Regular",
    color: "#666",
  },
  signupLinkText: {
    fontFamily: "OpenSans-Semibold",
    color: "#ffd700",
  },
  loginLinkText: {
    fontFamily: "OpenSans-Semibold",
    color: "#ffd700",
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
    fontFamily: "OpenSans-Regular",
    textAlign: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
});

export default loginSignupStyles;
