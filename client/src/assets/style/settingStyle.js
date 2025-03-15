import { StyleSheet, Dimensions } from "react-native";
import { FONTS, COLORS, FONT_SIZE } from "../constants/constant";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.container,
    },
    headerText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.extraLarge,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
        color: COLORS.black,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    settingsSection: {
        backgroundColor: COLORS.white,
        marginBottom: 20,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTextContainer: {
        marginLeft: 15,
    },
    settingTitle: {
        fontFamily: FONTS.semibold,
        fontSize: 16,
        color: 'black',
    },
    settingSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.small,
        color: 'gray',
    },
    actionButton: {
        paddingVertical: 5,
        textAlign:'center',
        minWidth:60,
        backgroundColor: '#ffa726',
        borderRadius: 5,
    },
    actionButtonText: {
        fontFamily: FONTS.regular,
        color: 'white',
        fontSize: 12,
        textAlign:'center'
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        padding: 30,
        borderRadius: 10,
        width: 300,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.semibold,
        color:COLORS.black,
        marginBottom: 20,
        textAlign:'center',
        letterSpacing:0.2,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal:15,
        backgroundColor:COLORS.lightgray,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: COLORS.gray,
        fontSize: FONT_SIZE.large,
        fontFamily:FONTS.regular,
    },
    logoutButton: {
        backgroundColor: COLORS.alert,
        paddingVertical: 10,
        paddingHorizontal:15,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: FONT_SIZE.large,
        fontFamily:FONTS.regular,
    },
});

export default styles;