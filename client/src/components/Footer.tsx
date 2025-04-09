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
    const socialLinks = [
        { icon: faX, url: 'https://twitter.com/yourhandle', label: 'Twitter' },
        { icon: faBrain, url: 'https://github.com/yourhandle', label: 'GitHub' },
        { icon: faLink, url: 'https://linkedin.com/in/yourhandle', label: 'LinkedIn' },
        { icon: faEnvelope, url: 'mailto:owner@produkto.com', label: 'Email' },
    ];

    const handleSocialPress = (url: string) => {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Owner Credits */}
                <Text style={styles.title}>elyukal.</Text>
                <Text style={styles.subtitle}>
                    Produkto Elyukal is created by LORMA students.
                    Visit our Help center or check our service advisories for any concerns
                </Text>

                {/* Social Links
                <View style={styles.socialContainer}>
                    {socialLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.socialItem}
                            onPress={() => handleSocialPress(link.url)}
                        >
                            <FontAwesomeIcon icon={link.icon} size={20} color={COLORS.black} />
                        </TouchableOpacity>
                    ))}
                </View> */}

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
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    socialItem: {
        marginHorizontal: 12,
    },
    versionText: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: 'rgba(117, 115, 115, 0.8)',
    },
});

export default Footer;