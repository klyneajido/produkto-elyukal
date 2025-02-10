import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    // Base container styles
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        position: 'relative',
    },

    headerContainer: {
        position: 'relative',
        marginBottom: 20,
    },

    productImage: {
        width: '100%',
        height: width * 0.75,
        resizeMode: 'cover',
    },

    productInfoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 15,
    },

    productTitle: {
        fontSize: 24,
        fontFamily: 'OpenSans-Bold',
        color: '#FFF',
        marginBottom: 5,
    },

    productMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#FFF',
    },

    detailsContainer: {
        padding: 20,
        paddingBottom: 80,
    },

    pricingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    priceText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FDD700',
        marginLeft: 10,
    },

    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    stockText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },

    arButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDD700',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

    arButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },

    sectionTitle: {
        fontSize: 20,
        fontFamily: 'OpenSans-Bold',
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#FDD700',
        paddingBottom: 5,
    },

    productDescription: {
        fontSize: 16,
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

    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: 10,
    },

    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 8,
        width: '48%',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    detailText: {
        marginLeft: 10,
        fontSize: 14,
        flex: 1,
        color: '#666',
        fontFamily: 'OpenSans-Regular',
    },

    closeButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

    closeButtonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 16,
        fontFamily: 'OpenSans-Regular',
    },

    responsiveText: {
        fontSize: width > 375 ? 16 : 14,
    },

    arButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },

    cameraButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 3,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },

    cameraButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cameraButtonInnerCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        position: 'absolute',
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default styles;