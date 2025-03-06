import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS, FONT_SIZE } from '../constants/constant';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.88;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  // Updated modern grid layout
  modernGridContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  modernRow: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  // Modern header style
  modernHeader: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  // Updated search bar with modern style
  modernSearchBarContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 15,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
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
  // Legacy styles - keeping these for backward compatibility
  topHeader: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTextContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xlarge,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  searchBarContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  municipalitiesContainer: {
    flex: 1,
    paddingTop: 16,
  },
  municipalitiesContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  // Modern card styles
  municipalityCard: {
    height: 180,
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  municipalityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  // New modern card overlay with gradient effect
  modernCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 20,
    // You can replace this with a linear gradient if using a gradient library
  },
  // Updated card content layout
  modernCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  // Updated location badge with modern pill shape
  modernLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.small,
    color: COLORS.white,
    marginLeft: 4,
  },
  // Updated municipality name style
  modernMunicipalityName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.large,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Legacy styles
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  attractionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  attractionsText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.small,
    color: COLORS.white,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  municipalityName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.large,
    color: COLORS.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  municipalityDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.small,
    color: 'rgba(255, 255, 255, 0.9)',
    width: cardWidth - 80,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    color: COLORS.gray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.medium,
    color: '#EF4444', 
    textAlign: 'center',
    backgroundColor: '#FEE2E2', 
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  noResultsText: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.grayDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default styles;