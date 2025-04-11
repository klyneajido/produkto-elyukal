import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    FlatList,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faSearch,
    faMapMarkerAlt,
    faMapPin,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { useNavigation } from '@react-navigation/native';
import styles from '../assets/style/municipalityStyle.js';
import { COLORS } from '../assets/constants/constant.ts';
import { Animated } from '@rnmapbox/maps';
import { Municipality, MunicipalityProps } from '../../types/types.ts';



const Municipalities: React.FC<MunicipalityProps> = ({
    onScroll
}) => {
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigation = useNavigation();

    // Calculate card width for 2 columns with proper spacing
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = (screenWidth - 40) / 2; // 40px for margins and padding

    // Update the styles object with dynamic card width
    const cardStyle = {
        ...styles.municipalityCard,
        width: cardWidth,
        height: 160, // Slightly reduced height for modern look
    };

    useEffect(() => {
        const fetchMunicipalities = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/municipalities/fetch_municipalities`);
                const fetchedMunicipalities = Array.isArray(response.data)
                    ? response.data
                    : response.data.municipalities || [];
                setMunicipalities(fetchedMunicipalities);
                setFilteredMunicipalities(fetchedMunicipalities);
                setLoading(false);
            } catch (e) {
                setError('Error fetching municipalities');
                setLoading(false);
                console.error('Fetch Error:', e);
            }
        };

        fetchMunicipalities();
    }, []);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredMunicipalities(municipalities);
        } else {
            const filtered = municipalities.filter(municipality =>
                municipality.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredMunicipalities(filtered);
        }
    }, [searchText, municipalities]);

    const handleMunicipalityPress = (municipalityId: string, municipalityName: string) => {
        navigation.navigate('MunicipalityDetail', {
            id: municipalityId,
            name: municipalityName,
            image_url: municipalities.find(m => m.id === municipalityId)?.image_url
        });
    };

    const renderMunicipalityCard = ({ item }: { item: Municipality }) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.card, { width: cardWidth }]}
            onPress={() => handleMunicipalityPress(item.id, item.name)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => console.log("Image load error - continuing silently")}
            />
            <View style={styles.cardOverlay} />
            <View style={styles.locationBadge}>
                <FontAwesomeIcon
                    icon={faMapPin}
                    size={10}
                    color={COLORS.white}
                />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cardAction}>
                    <Text style={styles.cardActionText}>Explore</Text>
                    <FontAwesomeIcon icon={faChevronRight} size={12} color={COLORS.white} />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.modernHeader}>
            <View style={styles.header}>
        <Text style={styles.headerTitle}>Municipalities</Text>
        <Text style={styles.headerSubtitle}>Discover local places</Text>
      </View>

                <View style={styles.modernSearchBarContainer}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        size={16}
                        color="#888"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchBar}
                        onChangeText={setSearchText}
                        value={searchText}
                        placeholder="Search Municipalities"
                        placeholderTextColor="#888"
                    />
                </View>
            </View>

            {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading municipalities...</Text>
        </View>
      ) : filteredMunicipalities.length > 0 ? (
        <FlatList
          data={filteredMunicipalities}
          renderItem={renderMunicipalityCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.centerContainer}>
          <FontAwesomeIcon
            icon={faSearch}
            size={40}
            color={COLORS.lightgray}
          />
          <Text style={styles.noResultsText}>No municipalities found</Text>
          <Text style={styles.noResultsSubtext}>
            Try another search term or check back later
          </Text>
        </View>
      )}
        </SafeAreaView>
    );
};

export default Municipalities;