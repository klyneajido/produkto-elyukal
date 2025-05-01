import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';

interface FooterProps {
    lightMode?: boolean;
}

const Footer: React.FC<FooterProps> = ({ lightMode = false }) => {
    return (
        <View style={[styles.container, lightMode && styles.containerLight]}>
            <View style={styles.content}>
                {/* Owner Credits */}
                <Text style={[styles.title, lightMode && styles.titleLight]}>elyukal.</Text>
                <Text style={[styles.subtitle, lightMode && styles.subtitleLight]}>
                    Produkto Elyukal is created by LORMA students.
                    Visit our Help center or check our service advisories for any concerns
                </Text>

                {/* Version Info */}
                <Text style={[styles.versionText, lightMode && styles.versionTextLight]}>
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
    containerLight: {
        backgroundColor: 'transparent',
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
    titleLight: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.small,
        color: 'rgba(53, 50, 50, 0.9)',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitleLight: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    versionText: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: 'rgba(117, 115, 115, 0.4)',
    },
    versionTextLight: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
});

export default Footer;
