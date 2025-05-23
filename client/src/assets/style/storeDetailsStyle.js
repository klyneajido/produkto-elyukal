import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, FONT_SIZE } from '../constants/constant';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:COLORS.white,
    },
    headerContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    storeImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    placeholderImage: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storeInfoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 15,
    },
    storeTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color:COLORS.white,
        marginBottom: 5,
    },
    storeMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        color:COLORS.white,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        marginLeft: 5,
        fontSize: 14,
        color:COLORS.white,
    },
    detailsContainer: {
        padding: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:COLORS.white,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    actionButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#FDD700',
        paddingBottom: 5,
    },
    storeDescription: {
        fontFamily:FONTS.regular,
        fontSize: FONT_SIZE.medium+2,
        color: '#444',
        lineHeight: 24,
        textAlign: 'justify',
        marginBottom: 20,
    },
    disclaimerContainer: {
        backgroundColor: '#F8F8F8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    disclaimerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        padding: 15,
        borderRadius: 10,
    },
    locationText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
        productsContainer: {
        marginTop: 10,
    },
    productCard: {
        backgroundColor:COLORS.white,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    productImage: {
        width: 130,
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: '#333',
        marginBottom: 4,
        letterSpacing: 0.2
    },
    productCategory: {
        fontSize: FONT_SIZE.medium,
        color: '#666',
        marginBottom: 8,
        backgroundColor:COLORS.lightgray,
        borderRadius:16,
        alignSelf: 'flex-start',
        paddingHorizontal: 5,
        paddingVertical:2,
        letterSpacing:0.1,
        textTransform:'capitalize'
    },
    productMetaContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
    
        alignItems: 'center',
    },
    productPrice: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.bold,
        color: COLORS.secondary,
    },
    productRating: {
        fontSize:FONT_SIZE.medium,
        color: '#666',
 
    },
    bottomContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
    
    },
    stockStatus: {
        fontSize: 14,
        fontFamily: FONTS.semibold,
        color:COLORS.black
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        marginTop: 10,
    },
    noProductsText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    emptyProductsContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        height: 250,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyStateWrapper: {
        alignItems: 'center',
        maxWidth: 280,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    storeIconWrapper: {
        position: 'absolute',
        bottom: -5,  // Adjusted from bottom: 0
        right: -5,   // Adjusted from right: 0
        backgroundColor: `${COLORS.secondary}20`,
        padding: 8,
        borderRadius: 20,
        transform: [], // Removed the transform
    },
    emptyProductsTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyProductsText: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
highlightsContainer: {
    marginVertical: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  highlightsContent: {
    borderRadius: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  highlightItemDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    opacity: 0.7,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFCB14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    backgroundColor: '#4A90E2',
  },
  iconDisabled: {
    backgroundColor: '#AAAAAA',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#777',
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  noHighlightText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
});

export default styles;
