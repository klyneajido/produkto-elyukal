import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS, FONT_SIZE } from '../assets/constants/constant';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
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
          <Text style={styles.headerTitle}>Terms and Conditions</Text>
          <Text style={styles.headerSubtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using elyukal, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of the terms, you may not access the service.
          </Text>

          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.paragraph}>
            Our service provides users with information about La Union's attractions and experiences. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of any third party.
          </Text>

          <Text style={styles.sectionTitle}>3. Location Services</Text>
          <Text style={styles.paragraph}>
            Our app uses your real-time location data to provide navigation services throughout La Union. By using the navigation features, you consent to the collection and processing of your location data. You can disable location services at any time through your device settings, but this will limit navigation functionality.
          </Text>

          <Text style={styles.sectionTitle}>4. User Responsibility</Text>
          <Text style={styles.paragraph}>
            While using our navigation features, you remain fully responsible for your actions, including following traffic rules and regulations. The app provides guidance only, and you should always exercise caution and good judgment when navigating. elyukal is not responsible for any accidents, injuries, or legal issues that may arise from your use of the navigation features.
          </Text>

          <Text style={styles.sectionTitle}>5. User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password and for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>6. Content</Text>
          <Text style={styles.paragraph}>
            Our service allows you to view content related to La Union. The content is owned by elyukal and is protected by copyright, trademark, and other laws.
          </Text>

          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall elyukal, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
          </Text>

          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify or replace these Terms at any time. It is your responsibility to check our Terms periodically for changes.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us.
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

export default TermsAndConditions;
