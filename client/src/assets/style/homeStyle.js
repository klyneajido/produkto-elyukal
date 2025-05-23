import { StyleSheet,Dimensions } from "react-native";
import { COLORS, FONT_SIZE, FONTS } from "../constants/constant";
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 20,
    marginVertical: 24,
    opacity: 0.2,
  },
  topContainer: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderBottomLeftRadius: 24,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.white,
    marginTop: 4,
    textAlign:'center',
    letterSpacing:0.1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal:5,
  },
  header: {
    paddingHorizontal: 5,
    paddingTop: 5,
    backgroundColor: COLORS.primary,
    paddingBottom:15,
  },
  headerTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.lightgray,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: "100%",
    color: COLORS.black,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    paddingVertical: 0,
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
  },

  carouselContainer: {
    marginVertical: 15,
    height: 150,
  },
  carouselScroll: {
    width: '100%',
  },
  carouselItem: {
    width: width * 0.9,
    height: 120,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  carouselTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.large,
    fontFamily:FONTS.semibold,
  },
  carouselSubtitle: {
    color: COLORS.lightgray,
    fontSize: FONT_SIZE.medium-1,
    fontFamily:FONTS.regular
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  image: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  productContainer: {
    marginTop: 8,
  },
  eventsContainer: {
   
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
  },
  sectionHeaderLink: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginHorizontal: 20,
    marginVertical: 24,
    opacity: 0.2,
  },
  buttonContainer:{
    alignItems:'flex-end'
  },
  exploreButton:{
    backgroundColor:COLORS.primary,
    padding:13,
    marginTop:15,
    borderRadius:7,
    alignItems:'center',
  },
  exploreText:{
    fontFamily:FONTS.semibold,
    letterSpacing:0.2,
    color:COLORS.white,
  
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 125,
    left: 25,
    right: 25,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    maxHeight: 200,
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000, 
  },
  searchResultsList: {
    flexGrow: 0,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultLoader: {
    borderWidth:1,
    paddingVertical:10,
  },
  highlightBox: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  highlightTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    opacity: 0.7,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
  },
  sectionHeaderLink: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  enhancedPromo: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 7,
},
promoPattern: {
  position: 'absolute',
  width: '100%',
  height: '100%',
  opacity: 0.6,
},
patternCircle: {
  position: 'absolute',
  borderRadius: 100,
  backgroundColor: COLORS.primary,
},
patternCircle1: {
  width: 120,
  height: 120,
  top: -40,
  right: -40,
  opacity: 0.15,
},
patternCircle2: {
  width: 80,
  height: 80,
  top: 100,
  left: -30,
  opacity: 0.1,
},
patternCircle3: {
  width: 60,
  height: 60,
  bottom: -20,
  right: 100,
  opacity: 0.1,
},
promoTextContainer: {
  padding: 24,
  paddingBottom: 28,
},
promoTagline: {
  fontFamily: FONTS.bold,
  fontSize: 12,
  letterSpacing: 1.5,
  color: COLORS.primary,
  marginBottom: 8,
},
promoHeadline: {
  fontFamily: FONTS.bold,
  fontSize: FONT_SIZE.xxLarge,
  color: COLORS.black,
  marginBottom: 10,
  lineHeight: 32,
},
promoSubtext: {
  fontFamily: FONTS.regular,
  fontSize: FONT_SIZE.medium,
  lineHeight: 20,
  color: 'rgba(0,0,0,0.7)',
  marginBottom: 20,
},
promoStats: {
  flexDirection: 'row',
  marginBottom: 24,
},
promoStatItem: {
  marginRight: 24,
},
promoStatNumber: {
  fontFamily: FONTS.bold,
  fontSize: 20,
  color: COLORS.primary,
},
promoStatLabel: {
  fontFamily: FONTS.regular,
  fontSize: 13,
  color: 'rgba(0,0,0,0.6)',
},
promoImageContainer: {
  position: 'relative',
  width: '100%',
  height: 180,
},
promoMainImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},
imageBadge: {
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: COLORS.white,
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
imageBadgeText: {
  fontFamily: FONTS.bold,
  fontSize: 12,
  color: COLORS.primary,
},

footerContainer: {
  backgroundColor: COLORS.white,
  paddingTop: 30,
  paddingBottom: 60,
  marginVertical: 20,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
},
footerTop: {
  alignItems: 'center',
  marginBottom: 20,
},
footerLogo: {
  width: 70,
  height: 70,
  marginBottom: 10,
  borderRadius: 100,
},
footerTagline: {
  fontFamily: FONTS.medium,
  fontSize: 14,
  color: COLORS.black,
  opacity: 0.7,
  textAlign: 'center',
},
footerDivider: {
  height: 1,
  backgroundColor: COLORS.black,
  opacity: 0.1,
  marginVertical: 20,
},
footerLinks: {
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: 25,
},
footerLinkItem: {
  marginHorizontal: 12,
  marginVertical: 8,
},
footerLinkText: {
  fontFamily: FONTS.medium,
  fontSize: 14,
  color: COLORS.black,
},
socialLinks: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: 25,
},
socialIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 8,
},
socialIconText: {
  color: COLORS.white,
  fontFamily: FONTS.semibold,
  fontSize: 12,
},
copyright: {
  fontFamily: FONTS.regular,
  fontSize: 12,
  color: COLORS.black,
  opacity: 0.5,
  textAlign: 'center',
},

  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Add these new styles to your existing homeStyle.js file

// Error handling styles
errorContainer: {
  position: 'absolute',
  top: 125,
  left: 0,
  right: 0,
  backgroundColor: '#ff5252',
  paddingVertical: 12,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1000,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
errorNetwork: {
  backgroundColor: '#ff9800', // Orange for network issues
},  
errorAuth: {
  backgroundColor: '#f44336', // Red for authentication issues
},
errorSearch: {
  backgroundColor: '#9c27b0', // Purple for search issues
},
errorGeneral: {
  backgroundColor: '#607d8b', // Blue-gray for general issues
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

// Search results improvements
searchResultsContainer: {
  position: 'absolute',
  top: 125,
  left: 25,
  right: 25,
  backgroundColor: COLORS.white,
  borderRadius: 12,
  maxHeight: 250, // Increased height
  elevation: 5, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  zIndex: 1000,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.05)',
},
searchResultsList: {
  flexGrow: 0,
  paddingVertical: 5,
},
searchResultItem: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0,0,0,0.05)',
},
searchResultText: {
  fontSize: FONT_SIZE.medium,
  fontFamily: FONTS.regular,
   paddingHorizontal: 15,
    paddingVertical: 10,
  letterSpacing: 0.1,
  color: '#333',
},
searchResultType: {
  fontSize: FONT_SIZE.small,
  color: COLORS.primary,
  fontFamily: FONTS.medium,
},
searchResultLoader: {
  padding: 15,
  alignItems: 'center',
  justifyContent: 'center',
},
noResultsText: {
  fontSize: FONT_SIZE.medium,
  fontFamily: FONTS.regular,
  color: COLORS.gray,
  textAlign: 'center',
  paddingVertical: 20,
  paddingHorizontal: 15,
  fontStyle: 'italic',
}
});

export default styles;
