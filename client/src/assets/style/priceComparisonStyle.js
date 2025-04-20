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
    priceContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:8,
    },
    price:{
        fontSize:FONT_SIZE.xxLarge,
        fontFamily:FONTS.bold,
        color:COLORS.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 12,
    },
    backButtonIcon: {
        color: COLORS.white,
    },
    headerTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        marginLeft: 15,
    },
    scrollView: {
        flex: 1,
        backgroundColor: COLORS.container,
    },
    productInfoContainer: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    productNameContainer: {
        padding: 8,
    },
    productName: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    comparisonText: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    noDataContainer: {
        padding: 24,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.medium,
        color: COLORS.gray,
    },
    bestDealContainer: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bestDealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        padding: 12,
    },
    bestDealIcon: {
        color: COLORS.white,  // Changed from secondary to white for better contrast
    },
    bestDealHeaderText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.medium,
        marginLeft: 8,
    },
    bestDealContent: {
        padding: 16,
    },
    bestDealStoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bestDealImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
    },
    bestDealStoreName: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    bestDealRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bestDealStarIcon: {
        color: '#FDD700',
    },
    bestDealRating: {
        marginLeft: 4,
        color: COLORS.gray,
        fontFamily: FONTS.medium,
    },
    bestDealPriceContainer: {
        backgroundColor: 'rgba(98, 0, 238, 0.05)',
        padding: 16,
        borderRadius: 12,
    },
    bestDealPriceLabel: {
        fontSize: FONT_SIZE.small,
        color: COLORS.gray,
        fontFamily: FONTS.medium,
    },
    bestDealPrice: {
        fontSize: FONT_SIZE.xxLarge,
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        marginVertical: 4,
    },
    viewDealButton: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    viewDealButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.medium,
    },
    allOptionsContainer: {
        margin: 16,
    },
    allOptionsTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 16,
    },
    storeCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    selectedStoreCard: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    storeCardContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    storeInfo: {
        flex: 1,
    },
    storeName: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.bold,
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
        color: COLORS.highlight,  // Changed from gold to highlight for better visibility
    },
    outOfStockText: {
        color: COLORS.gray,
    },
    inStockIcon: {
        color: COLORS.highlight,  // Changed from secondary to highlight
    },
    outOfStockIcon: {
        color: COLORS.gray,  // Changed from secondary to gray
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
        color: COLORS.white,  // Changed from white to black for better contrast with secondary
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
        marginTop: 8,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    savingsText: {
        color: '#4CAF50',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.small,
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
