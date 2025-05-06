import { StyleSheet, Dimensions} from "react-native";
import { COLORS, FONTS, FONT_SIZE } from "../constants/constant";

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
console.log(screenWidth);
const loginSignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
signupButtonDisabled: {
    backgroundColor: COLORS.gray, // Dimmed color when disabled
    opacity: 0.6,
},
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor:COLORS.primary,
    marginBottom:30,
    borderBottomLeftRadius: 20,
    overflow:'hidden',
  },
  gradientContainer:{
    height: 200,
    width: screenWidth,
    padding:15,

  },
  text:{
    fontFamily:FONTS.bold,
    fontSize: 35,
    marginLeft:15,
    marginTop:20,
    color:COLORS.white
  },
  subText:{
    marginLeft:15,
    fontFamily:FONTS.regular,
    color:COLORS.white
  },
  logo: {
    width: 100,
    height: 100,
  },
  appTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.white,
    marginTop: 15,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginHorizontal:15,
  },
  taglineText:{
    color: COLORS.black,
    fontFamily:FONTS.bold,
    fontSize:FONT_SIZE.large,
    color:COLORS.white,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: FONTS.regular,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontFamily: FONTS.regular,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
},
  loginButton: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:20,
  },
  loginButtonText: {
    fontFamily: FONTS.semibold,
    color: '#fff',
    fontSize: 16,
  },
  signupButtonText: {
    fontFamily: FONTS.semibold,
    color: '#fff',
    fontSize: FONT_SIZE.large,
    letterSpacing:0.5
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop:50,
    marginBottom:40,
  },
  signupText: {
    fontFamily: FONTS.regular,
    color: '#666',
  },
  loginText: {
    fontFamily: FONTS.regular,
    color: '#666',
  },
  signupLinkText: {
    fontFamily: FONTS.semibold,
    color:  COLORS.secondary,
  },
  loginLinkText: {
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
  },
  footerContainer:{
    marginTop:100,
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

//MODALS
modalBackdrop: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContainer: {
  backgroundColor: COLORS.white,
  borderRadius: 16,
  padding: 24,
  width: '90%',

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
button: {
  marginTop: 16,
  backgroundColor: COLORS.primary,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: COLORS.gray,
},
buttonText: {
  color: COLORS.white,
  fontWeight: 'bold',
},

// Add these styles for the verification modal
verificationModalTitle: {
  fontSize: FONT_SIZE.large,
  fontFamily: FONTS.semibold,
  color: COLORS.black,
  marginBottom: 12,
},
verificationModalText: {
  fontSize: FONT_SIZE.medium,
  fontFamily: FONTS.regular,
  color: COLORS.gray,
  marginBottom: 20,
  lineHeight: 22,
},
verificationErrorText: {
  color: COLORS.error || 'red',
  fontSize: FONT_SIZE.small,
  fontFamily: FONTS.regular,
  marginBottom: 16,
  textAlign: 'center',
},
verificationButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 16,
},
verificationButton: {
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
verifyButton: {
  flex: 1,
  marginRight: 8,
  backgroundColor: COLORS.primary,
},
resendButton: {
  flex: 1,
  marginLeft: 8,
  backgroundColor: COLORS.secondary,
},
cancelVerificationButton: {
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
},
verificationButtonText: {
  fontSize: FONT_SIZE.medium,
  fontFamily: FONTS.medium,
  color: COLORS.white,
},
disabledButton: {
  opacity: 0.6,
},
});

export default loginSignupStyles;
