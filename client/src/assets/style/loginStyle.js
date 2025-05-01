import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONT_SIZE, FONTS } from "../constants/constant";

const screenWidth = Dimensions.get("window").width;
const loginSignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  upperContainer: {
    alignItems: "center",
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },
  logoContainer: {
    flexDirection:'row',
    alignItems:'center',
    marginBottom:15 ,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor:'rgba(255,255,255,0.5)',
    borderRadius: 20, 
    marginLeft:10,
    padding:13,

  },
  float:{
    borderWidth:2
  },
  bgImg: {
    height: 200,
    width: screenWidth,
    padding: 15,
  },
  gradientContainer: {
    height: 200,
    width: screenWidth,
    padding: 15,

  },
  miniText: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZE.large,
    marginLeft: 15,
    marginTop: 30,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xxxLarge,
    marginLeft: 15,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subText: {
    marginLeft: 15,
    fontFamily: FONTS.regular,
    color: COLORS.lightgray,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputContainer: {
    alignItems: "center",
    borderRadius: 10,
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
    fontFamily: FONTS.semibold,
    color: COLORS.gray,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    flexDirection: "row",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  errorBanner: {
    backgroundColor: "#ffe6e6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ff9999",
  },
  errorText: {
    color: "#cc0000",
    fontSize: 14,
    textAlign: "center",
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
    fontFamily: FONTS.semibold,
    color: COLORS.white,
    fontSize: FONT_SIZE.large,
    letterSpacing: 0.5,
  },
  loginGoogleButtonText: {
    fontFamily: FONTS.semibold,
    color: COLORS.white,
    fontSize: FONT_SIZE.large,
    letterSpacing: 0.5,
    
  },
  continueGuestButtonText: {
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
    fontSize: FONT_SIZE.large,
    letterSpacing: 0.5,
  },
  loginGoogleButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    flexDirection: "row",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  googleIcon: {
    marginRight: 10,
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


  footerContainer: {
    marginTop: 100,
  },
  modernErrorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modernErrorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  modernErrorText: {
    color: '#fff',
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    marginLeft: 10,
    flex: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 20,
    color: COLORS.primary,
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.medium,
    letterSpacing: 0.5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  orText: {
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
});

export default loginSignupStyles;
