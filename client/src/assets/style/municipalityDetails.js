import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS, FONT_SIZE } from "../constants/constant";

const { width } = Dimensions.get("window");
const COLUMN_GAP = 15;
const PRODUCT_COLUMN_WIDTH = (width - 40 - COLUMN_GAP) / 2; // 40 for container padding

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  navbar: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  navRight: {
    flexDirection: "row",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 40,
    left: 20,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.black,
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZE.medium,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  title: {
    fontSize: FONT_SIZE.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 20,
  },
  descriptionContainer: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: COLORS.container,
    borderRadius: 15,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginBottom: 15,
  },
  productsContainer: {
    marginTop: 20,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: PRODUCT_COLUMN_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  productImagePlaceholder: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: COLORS.container,
    justifyContent: "center",
    alignItems: "center",
  },
  productImagePlaceholderText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
  },
  productContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 8,
    height: 40, // Limit to 2 lines
  },
  productInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  productPrice: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  inStockText: {
    fontSize: FONT_SIZE.small - 1,
    fontFamily: FONTS.regular,
    color: "#2E7D32", // Green
  },
  outOfStockText: {
    fontSize: FONT_SIZE.small - 1,
    fontFamily: FONTS.regular,
    color: "#C62828", // Red
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  emptyProductsContainer: {
    backgroundColor: COLORS.container,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    height: 150,
  },
  emptyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  emptyProductsText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.medium,
    color: COLORS.gray,
    textAlign: "center",
  }
});