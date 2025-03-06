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
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { useNavigation } from '@react-navigation/native';
import styles from '../assets/style/municipalityStyle.js';
import { COLORS } from '../assets/constants/constant.ts';

// Interface for municipality data
interface Municipality {
    id: string;
    name: string;
    image_url: string;
}

// Interface for props, including scroll-related handlers
interface MunicipalityProps {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    onMomentumScrollEnd?: () => void;
}

const Municipalities: React.FC<MunicipalityProps> = ({
    onScroll,
    onTouchStart,
    onTouchEnd,
    onMomentumScrollEnd,
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
            name: municipalityName
        });
    };

    const renderMunicipalityCard = ({ item }: { item: Municipality }) => (
        <TouchableOpacity
            key={item.id}
            style={cardStyle}
            onPress={() => handleMunicipalityPress(item.id, item.name)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.image_url }}
                style={styles.municipalityImage}
                resizeMode="cover"
            />
            <View style={styles.modernCardOverlay} />
            <View style={styles.modernCardContent}>
                <View style={styles.modernLocationBadge}>
                    <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        size={12}
                        color={COLORS.white}
                    />
                    <Text style={styles.locationText}>La Union</Text>
                </View>
                <Text style={styles.modernMunicipalityName}>{item.name}</Text>
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
                        placeholder="Search municipalities"
                        placeholderTextColor="#888"
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading municipalities...</Text>
                </View>
            ) : filteredMunicipalities.length > 0 ? (
                <FlatList
                    data={filteredMunicipalities}
                    renderItem={renderMunicipalityCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.modernGridContainer}
                    columnWrapperStyle={styles.modernRow}
                    showsVerticalScrollIndicator={false}
                    onScroll={onScroll}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    scrollEventThrottle={16} // Ensures smooth scroll handling
                />
            ) : (
                <View style={styles.noResults}>
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