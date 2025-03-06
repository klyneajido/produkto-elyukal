import { StyleSheet } from "react-native";
import { COLORS, FONT_SIZE, FONTS } from "../../assets/constants/constant"; // Adjust path based on your project structure

const styles = StyleSheet.create({
  eventList: {
    marginHorizontal: 20,
  },
  eventItem: {
    width: 200, // Fixed width for each event card in the horizontal list
    marginRight: 16, // Space between cards in the horizontal list
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  eventImage: {
    width: "100%",
    height: 120, // Fixed height for the event image
    resizeMode: "cover",
  },
  eventImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetails: {
    padding: 12,
  },
  eventTitle: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZE.medium, // e.g., 16
    color: COLORS.black,
    marginBottom: 4,
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  eventDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.small, // e.g., 14
    color: COLORS.primary,
    marginBottom: 2,
  },
  eventLocation: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.small, // e.g., 14
    color: COLORS.black,
    opacity: 0.7,
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  noEventsText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.medium, // e.g., 16
    color: COLORS.black,
    opacity: 0.7,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default styles;