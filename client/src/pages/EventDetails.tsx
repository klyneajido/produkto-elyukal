import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faShare,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faPeopleGroup,
  faHeart,
  faMusic,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../assets/style/eventDetailsStyle';
import { COLORS } from '../assets/constants/constant';

const EventDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const event = route.params?.event;
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me at ${event.name} - A cultural festival at ${event.location} on ${event.date}!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const highlights = [
    { icon: faMusic, title: 'Live Performances', description: 'Traditional music and dances' },
    { icon: faUtensils, title: 'Local Cuisine', description: 'Taste authentic regional dishes' },
    { icon: faPeopleGroup, title: 'Cultural Shows', description: 'Experience local traditions' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image with Parallax */}
        <View style={styles.imageContainer}>
          <Image source={event.image} style={styles.headerImage} />
          <View style={styles.overlay} />

          {/* Navigation Bar */}
          <View style={styles.navbar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.navButton}
            >
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={toggleFavorite}>
                <FontAwesomeIcon 
                  icon={faHeart} 
                  size={20} 
                  color={isFavorite ? COLORS.secondary : "#fff"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{event.name}</Text>

          {/* Key Information */}
          <View style={styles.keyInfo}>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faCalendar} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{event.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faClock} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{event.time}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          </View>

          {/* Festival Highlights */}
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Festival Highlights</Text>
            <View style={styles.highlightsGrid}>
              {highlights.map((item, index) => (
                <View key={index} style={styles.highlightCard}>
                  <FontAwesomeIcon icon={item.icon} size={24} color={COLORS.primary} />
                  <Text style={styles.highlightTitle}>{item.title}</Text>
                  <Text style={styles.highlightDescription}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About the Festival</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          {/* Join Community Section */}
          <View style={styles.communitySection}>
            <Text style={styles.sectionTitle}>Join the Community</Text>
            <TouchableOpacity style={styles.communityButton}>
              <FontAwesomeIcon icon={faPeopleGroup} size={20} color="#fff" />
              <Text style={styles.communityButtonText}>Join Festival Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetails;