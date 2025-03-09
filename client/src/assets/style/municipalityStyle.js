// municipalityStyle.js
import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS, FONT_SIZE } from "../constants/constant";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Softer background
  },
  modernHeader: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modernSearchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    height:40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: COLORS.black,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    paddingVertical: 0,
  },
  modernGridContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 100, 
  },
  modernRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  municipalityCard: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  municipalityImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  modernCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Darker overlay for better text contrast
    borderRadius: 16,
  },
  modernCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  modernBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  modernMunicipalityName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.large,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.medium,
    color: COLORS.gray,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  errorText: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.medium,
    color: COLORS.red,
    textAlign: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.grayDark,
    marginBottom: 8,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: "center",
  },
});

export default styles;
