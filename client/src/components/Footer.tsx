import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    StyleSheet,
} from 'react-native';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faX, faBrain, faLink, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Owner Credits */}
                <Text style={styles.title}>elyukal.</Text>
                <Text style={styles.subtitle}>
                    Produkto Elyukal is created by LORMA students.
                    Visit our Help center or check our service advisories for any concerns
                </Text>

                {/* Version Info */}
                <Text style={styles.versionText}>
                    Version: Beta | © {new Date().getFullYear()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontFamily:'Eurostile',
        fontSize: FONT_SIZE.extraLarge,
        color: COLORS.primary,
        marginBottom: 10,
        letterSpacing: 1,
        textTransform: 'lowercase',
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.small,
        color: 'rgba(53, 50, 50, 0.9)',
        marginBottom: 15,
        textAlign: 'center',
    },
    versionText: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: 'rgba(117, 115, 115, 0.8)',
    },
});

export default Footer;