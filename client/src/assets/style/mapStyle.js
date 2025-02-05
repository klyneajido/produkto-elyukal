import { StyleSheet } from "react-native";
import { COLORS } from "../constants/constant";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    annotationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    annotationImage: {
        width: 36,  // A bit smaller than the container
        height: 36,
        borderRadius: 18, 
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    labelContainer: {
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 4,
        marginBottom: 4,
        borderWidth: 0,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    labelText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'OpenSans-Regular',
    },
    overlay: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    overlayImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    overlayTitle: {
        fontSize: 18,
        fontFamily: 'OpenSans-Bold',
        color: '#333',
        marginBottom: 5,
    },
    overlayType: {
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
        color: '#666',
        marginBottom: 5,
    },
    overlayRating: {
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
        color: '#333',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        fontFamily: 'OpenSans-Regular',
    },
    controlButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: '#ffd700',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
},
    activeControlButton: {
        backgroundColor: '#4a90e2',
    },
});
export default styles;