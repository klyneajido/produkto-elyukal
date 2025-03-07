import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONTS } from '../constants/constant';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingIndicator: {
        color: COLORS.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.primary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightgray,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
        padding: 5,
    },
    backButtonIcon: {
        color: COLORS.white,
    },
    headerTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    scrollView: {
        backgroundColor: COLORS.container,
    },
    productInfoContainer: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightgray,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    productNameContainer: {
        flex: 1,
    },
    productName: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.semibold,
        color: COLORS.black,
        marginBottom: 4,
    },
    comparisonText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    noDataContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        textAlign: 'center',
    },
    bestDealContainer: {
        margin: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.lightgray,
    },
    bestDealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: COLORS.secondary,
    },
    bestDealIcon: {
        color: COLORS.secondary,
    },
    bestDealHeaderText: {
        marginLeft: 8,
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.medium,
    },
    bestDealContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bestDealStoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bestDealImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    bestDealStoreName: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    bestDealRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bestDealStarIcon: {
        color: COLORS.gold,
    },
    bestDealRating: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginLeft: 4,
    },
    bestDealPriceContainer: {
        alignItems: 'flex-end',
    },
    bestDealPriceLabel: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    bestDealPrice: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.secondary,
        marginBottom: 8,
    },
    viewDealButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    viewDealButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.semibold,
        fontSize: FONT_SIZE.small,
    },
    allOptionsContainer: {
        margin: 16,
        marginTop: 0,
    },
    allOptionsTitle: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.bold,
        color: COLORS.accent,
        marginBottom: 12,
    },
    storeCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.lightgray,
    },
    selectedStoreCard: {
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    storeCardContent: {
        padding: 12,
        flexDirection: 'row',
    },
    storeImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    storeInfo: {
        flex: 1,
        marginRight: 8,
    },
    storeName: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.semibold,
        color: COLORS.black,
        marginBottom: 4,
    },
    storeRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    storeStarIcon: {
        color: COLORS.gold,
    },
    storeRating: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginLeft: 4,
    },
    storeType: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginLeft: 8,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        marginLeft: 4,
    },
    inStockText: {
        color: COLORS.gold,
    },
    outOfStockText: {
        color: COLORS.gray,
    },
    inStockIcon: {
        color: COLORS.secondary,
    },
    outOfStockIcon: {
        color: COLORS.secondary,
    },
    priceInfoContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    storePrice: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    bestDealStorePrice: {
        color: COLORS.primary,
    },
    bestPriceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginBottom: 4,
    },
    bestPriceTagIcon: {
        color: COLORS.white,
    },
    bestPriceTagText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.semibold,
        color: COLORS.white,
        marginLeft: 4,
    },
    savingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savingsIcon: {
        color: COLORS.gray,
    },
    savingsText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        marginLeft: 4,
    },
    currentSelectionBadge: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 4,
        alignItems: 'center',
    },
    currentSelectionText: {
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.semibold,
        color: COLORS.white,
    },
});