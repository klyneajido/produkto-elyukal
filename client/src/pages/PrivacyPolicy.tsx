import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS, FONT_SIZE } from '../assets/constants/constant';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon icon={faChevronLeft} size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.paragraph}>
            This Privacy Policy describes how elyukal collects, uses, and discloses your personal information when you use our application.
          </Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as your name, email address, and profile information when you register for an account. Additionally, with your permission, we collect location data to enable navigation features.
          </Text>

          <Text style={styles.sectionTitle}>2. Location Data</Text>
          <Text style={styles.paragraph}>
            When you use our navigation features, we collect and process your real-time location data to provide turn-by-turn directions and show your position on the map. This data is used only while you are actively using the app and is not stored permanently or shared with third parties except as necessary to provide the navigation service. You can disable location services at any time through your device settings.
          </Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, communicate with you, and personalize your experience.
          </Text>

          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not share your personal information with third parties except as described in this Privacy Policy, such as with service providers who assist us in our operations.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly.
          </Text>

          <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at produktoeyukalph@gmail.com
          </Text>
        </View>
        <View style={styles.footerContainer}>
        <Footer />
      </View>
      </ScrollView>
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.container,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.lightgray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  footerContainer: {
    width: '100%',
  },
});

export default PrivacyPolicy;
