import { StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS, FONT_SIZE } from "../constants/constant";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 350,
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
  },
  title: {
    fontSize: FONT_SIZE.extraLarge,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 20,
  },
  keyInfo: {
    backgroundColor: COLORS.container,
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    marginTop: 8,
    color: COLORS.black,
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
  },
  detailContainer: {
    flexDirection: "row",
    marginBottom:10,
  },
  left: {
    width: 60,
    margin: 1,
    borderRadius: 5,
    flex:1 ,
    overflow:'hidden',
    alignItems:'center',
    justifyContent:'center'
  },
  date: {

    backgroundColor: "white",
    shadowColor: COLORS.black,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, 
    borderRadius: 5,
  },
  
  topCalendar: {
    width:'100%',
    borderBottomWidth: 1,
    textAlign: "center",
    color: COLORS.white,
    height: 20,
    fontFamily:FONTS.semibold,
    backgroundColor:COLORS.primary

  },
  bottomCalendar: {
    width:'100%',
    flexDirection:'row',
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    color: COLORS.black,
    fontSize: FONT_SIZE.large,
    height: 40,
    fontFamily:FONTS.regular,
  },
  right: {
    marginLeft:30,
    flex:3
  },
  topDetails: {
    color:COLORS.black,
    fontSize:FONT_SIZE.large-2,
    fontFamily:FONTS.semibold,
  },
  bottomDetails: {
    color:COLORS.gray,
    fontFamily:FONTS.regular,
  },

  locationIconContainer:{
    width:40,
    height: 40,
    borderWidth:1
  },




  highlightsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginBottom: 15,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -5,
  },
  highlightCard: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.container,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  highlightTitle: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  highlightDescription: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    textAlign: "center",
  },
  descriptionSection: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    lineHeight: 24,
    color: COLORS.black,
  },
  communitySection: {
    marginBottom: 30,
    alignItems: "center",
  },
  communityButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
  },
  communityButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.semibold,
    marginLeft: 10,
  },
  emptyHighlightsContainer: {
    backgroundColor: COLORS.container,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    height: 120,
  },
  emptyHighlightsText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.medium,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 10,
  },
  emptyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
});
