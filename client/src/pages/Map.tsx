import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    View,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Image,
    PermissionsAndroid,
    Platform,
    Linking,
    Modal,
    Alert,
    TextInput,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faSatelliteDish, faDirections, faClock, faRoad, faLocationDot, faSearch, faTimes, faFilter, faCog } from '@fortawesome/free-solid-svg-icons';
import styles from '../assets/style/mapStyle';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { BASE_URL } from '../config/config';
import axios from 'axios';
import { Store, RootStackParamList, RouteInfo } from '../../types/types';
import IntentLauncher from 'react-native-intent-launcher';
import { COLORS } from '../assets/constants/constant.ts';
import SpinningCubeLoader from '../components/SpinningCubeLoader';

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const directionsClient = MapboxDirections({ accessToken: MAPBOX_ACCESS_TOKEN });

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreDetails'>;

const MapView = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [storeTypes, setStoreTypes] = useState<string[]>(['All']);
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    const mapRef = useRef(null);
    const cameraRef = useRef<MapboxGL.Camera>(null);
    const searchInputRef = useRef<TextInput>(null);
    const locationRef = useRef<MapboxGL.Location | null>(null);

    const initialCamera = {
        centerCoordinate: [120.33591510283381, 16.668377634915878], 
        zoomLevel: 10,
        pitch: 0,
        heading: 0
    };

    // Fetch stores from the API
    const fetchStores = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/stores/fetch_stores`);

            if (response.data && response.data.length > 0) {
                const processedStores: Store[] = response.data
                    .map((store: Store) => {
                        if (
                            Math.abs(store.latitude) > 90 ||
                            Math.abs(store.longitude) > 180
                        ) {
                            console.log(`Invalid coordinates for store ${store.store_id}`);
                            return null;
                        }
                        return {
                            ...store,
                            coordinate: [store.longitude, store.latitude] as [number, number]
                        };
                    })
                    .filter((store): store is Store => store !== null);

                setStores(processedStores);
                setFilteredStores(processedStores);

                // Extract unique store types
                const validTypes = processedStores
                    .map((store: Store) => store.type)
                    .filter((type): type is string => type !== null);
                const storeTypesSet = new Set<string>(validTypes);
                const types: string[] = ['All', ...storeTypesSet];
                setStoreTypes(types);

                if (processedStores.length > 0) {
                    const firstStore = processedStores[0];
                    cameraRef.current?.setCamera({
                        centerCoordinate: [firstStore.longitude, firstStore.latitude],
                        zoomLevel: 12,
                        animationDuration: 0,
                    });
                }
            } else {
                setError('No stores found at the moment.');
            }
        } catch (err: any) {
            console.log('Error fetching stores:', err);
            setError('Oops! We couldn’t load the stores right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
        checkInitialPermission();
    }, []);

    const checkInitialPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                setIsLocationPermissionGranted(granted);
                
                if (!granted) {
                    requestLocationPermission();
                }
            } catch (err) {
                console.warn('Error checking initial permission:', err);
            }
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "PRODUKTO-ELYUKAL needs access to your location " +
                                "to provide navigation services and show your position on the map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Location permission granted");
                    setIsLocationPermissionGranted(true);
                    return true;
                } else {
                    console.log("Location permission denied");
                    setIsLocationPermissionGranted(false);
                    setShowLocationError(true);
                    return false;
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const checkAndRequestLocationServices = async () => {
        if (Platform.OS !== 'android') return true;
        
        if (userLocation && isLocationEnabled) {
            return true;
        }
        
        setShowLocationError(true);
        return false;
    };

    const fetchRoute = async (destination: [number, number]) => {
        if (!userLocation || !isLocationPermissionGranted) return;

        try {
            const response: any = await directionsClient.getDirections({
                waypoints: [
                    { coordinates: userLocation },
                    { coordinates: destination }
                ],
                profile: 'driving',
                geometries: 'geojson'
            }).send();

            if (response?.body?.routes?.[0]) {
                const route = response.body.routes[0];
                setRouteInfo({
                    geometry: route.geometry,
                    duration: route.duration,
                    distance: route.distance
                });
            }
        } catch (error) {
            console.log('Route fetching error', error);
            Alert.alert('Error', 'Failed to fetch route information. Please try again.');
        }
    };

    const handleLocationUpdate = (location: MapboxGL.Location) => {
        if (location && location.coords) {
            locationRef.current = location;
            const { coords } = location;
            setUserLocation([coords.longitude, coords.latitude]);
            setIsLocationEnabled(true);
            setShowLocationError(false);
        }
    };

    const handleStorePress = (store: Store) => {
        setSelectedStore(store);
        setRouteInfo(null);

        const verticalOffset = -0.003; 

        if (store.coordinate) {
            cameraRef.current?.setCamera({
                centerCoordinate: [
                    store.coordinate[0],
                    store.coordinate[1] + verticalOffset
                ],
                zoomLevel: 15,
                animationDuration: 1000,
            });
        } else if (store.latitude && store.longitude) {
            cameraRef.current?.setCamera({
                centerCoordinate: [
                    store.longitude,
                    store.latitude + verticalOffset
                ],
                zoomLevel: 15,
                animationDuration: 1000,
            });
        }
    };

    const handleNavigatePress = async () => {
        if (!selectedStore) return;
        
        // If location permission and services are already enabled, proceed directly
        if (isLocationPermissionGranted && userLocation && isLocationEnabled) {
            try {
                const destination = selectedStore.coordinate || [selectedStore.longitude, selectedStore.latitude];
                
                const response = await directionsClient.getDirections({
                    profile: 'driving',
                    geometries: 'geojson',
                    waypoints: [
                        { coordinates: userLocation },
                        { coordinates: destination as [number, number] }
                    ]
                }).send();
                
                if (response.body.routes.length > 0) {
                    const route = response.body.routes[0];
                    setRouteInfo({
                        geometry: route.geometry,
                        duration: route.duration,
                        distance: route.distance
                    });
                }
            } catch (error) {
                console.log('Error fetching route:', error);
                Alert.alert('Error', 'Unable to fetch route. Please try again.');
            }
            return;
        }

        // Check permission if not granted
        if (!isLocationPermissionGranted) {
            const granted = await requestLocationPermission();
            if (!granted) return;
        }
        
        // Check location services if not enabled
        const locationServicesEnabled = await checkAndRequestLocationServices();
        if (!locationServicesEnabled) {
            setShowLocationError(true);
            return;
        }
        
        // If we have user location and selected store after checks, try to fetch route
        if (userLocation && selectedStore) {
            try {
                const destination = selectedStore.coordinate || [selectedStore.longitude, selectedStore.latitude];
                
                const response = await directionsClient.getDirections({
                    profile: 'driving',
                    geometries: 'geojson',
                    waypoints: [
                        { coordinates: userLocation },
                        { coordinates: destination as [number, number] }
                    ]
                }).send();
                
                if (response.body.routes.length > 0) {
                    const route = response.body.routes[0];
                    setRouteInfo({
                        geometry: route.geometry,
                        duration: route.duration,
                        distance: route.distance
                    });
                }
            } catch (error) {
                console.log('Error fetching route:', error);
                Alert.alert('Error', 'Unable to fetch route. Please try again.');
            }
        } else {
            setShowLocationError(true);
        }
    };

    const handleCloseOverlay = () => {
        setSelectedStore(null);
    };

    const clearRoute = () => {
        setRouteInfo(null);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            if (selectedFilter && selectedFilter !== "All") {
                setFilteredStores(stores.filter(store => store.type === selectedFilter));
            } else {
                setFilteredStores(stores);
            }
            setShowSearchResults(false);
            return;
        }

        const results = stores.filter(store =>
            store.name.toLowerCase().includes(text.toLowerCase()) ||
            (store.type && store.type.toLowerCase().includes(text.toLowerCase())) ||
            (store.description && store.description.toLowerCase().includes(text.toLowerCase()))
        );
        setFilteredStores(results);
        setShowSearchResults(true);
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (selectedFilter && selectedFilter !== "All") {
            setFilteredStores(stores.filter(store => store.type === selectedFilter));
        } else {
            setFilteredStores(stores);
        }
        setShowSearchResults(false);
    };

    const handleSearchButtonPress = () => {
        setShowSearchBar(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const filterStores = (type: string | null) => {
        if (!type || type === "All") {
            setFilteredStores(stores);
        } else {
            setFilteredStores(stores.filter(store => store.type === type));
        }
        setSelectedFilter(type);
        setShowFilter(false);
    };

    const toggleMapStyle = () => {
        setMapStyle(current =>
            current === 'mapbox://styles/mapbox/streets-v11'
                ? 'mapbox://styles/mapbox/satellite-streets-v11'
                : 'mapbox://styles/mapbox/streets-v11'
        );
    };

    const renderAnnotations = () => (
        filteredStores.map((store: Store) => {
            const coordinate = store.coordinate || [store.longitude, store.latitude];

            return (
                <MapboxGL.MarkerView
                    key={store.store_id}
                    coordinate={coordinate as [number, number]}
                    anchor={{ x: 0.5, y: 0.5 }}
                >
                    <TouchableOpacity
                        style={styles.annotationContainer}
                        onPress={() => handleStorePress(store)}
                    >
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>{store.name}</Text>
                        </View>
                        {store.store_image ? (
                            <Image
                                source={{ uri: store.store_image }}
                                style={styles.annotationImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.annotationImage, { backgroundColor: '#ccc' }]} />
                        )}
                    </TouchableOpacity>
                </MapboxGL.MarkerView>
            );
        })
    );

    const renderLocationErrorModal = () => {
        if (!showLocationError) return null;

        return (
            <Modal
                transparent={true}
                visible={showLocationError}
                animationType="fade"
                statusBarTranslucent
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <FontAwesomeIcon icon={faLocationDot} size={22} color={COLORS.alert} />
                            </View>
                            <Text style={styles.modalTitle}>Location Services Disabled</Text>
                        </View>
                        
                        <Text style={styles.modalDescription}>
                            Please enable location services in your device settings to use navigation features and see your current location on the map.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowLocationError(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={() => {
                                    IntentLauncher.startActivity({
                                        action: 'android.settings.LOCATION_SOURCE_SETTINGS'
                                    });
                                    setShowLocationError(false);
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={faCog}
                                    size={16}
                                    color={COLORS.white}
                                    style={styles.logoutButtonIcon}
                                />
                                <Text style={styles.logoutButtonText}>Settings</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderStoreOverlay = () => {
        if (!selectedStore) return null;
        const imageSource = selectedStore.store_image
            ? { uri: selectedStore.store_image }
            : require('../assets/img/events/culinary-arts.png'); 

        return (
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.closeButton} onPress={handleCloseOverlay}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                
                <Image
                    source={imageSource}
                    style={styles.overlayImage}
                    resizeMode="cover"
                />
                
                <Text style={styles.overlayTitle}>{selectedStore.name}</Text>
                
                <View style={styles.infoContainer}>
                    <Text style={styles.overlaySubtitle}>{selectedStore.type || 'General Store'}</Text>
                    <Text style={styles.ratingText}>
                        {selectedStore.rating.toFixed(1)} ★
                    </Text>
                    {routeInfo && (
                        <View style={styles.routeInfoContainer}>
                            <View style={styles.routeInfoItem}>
                                <FontAwesomeIcon icon={faClock} size={16} color="#666666" />
                                <Text style={styles.routeInfoText}>
                                    {`${Math.round(routeInfo.duration / 60)} min`}
                                </Text>
                            </View>
                            <View style={styles.routeInfoItem}>
                                <FontAwesomeIcon icon={faRoad} size={16} color="#666666" />
                                <Text style={styles.routeInfoText}>
                                    {`${(routeInfo.distance / 1000).toFixed(1)} km`}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => navigation.navigate('StoreDetails', { store: selectedStore })}
                    >
                        <Text style={styles.viewDetailsButtonText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={handleNavigatePress}
                    >
                        <FontAwesomeIcon icon={faDirections} size={20} color="#fff" />
                        <Text style={styles.navigateButtonText}>Navigate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <MapboxGL.MapView
                ref={mapRef}
                style={styles.map}
                styleURL={mapStyle}
                onPress={() => {
                    setSelectedStore(null);
                    setShowSearchResults(false);
                }}
            >
                <MapboxGL.UserLocation
                    visible={true}
                    onUpdate={handleLocationUpdate}
                />

                <MapboxGL.Camera
                    ref={cameraRef}
                    zoomLevel={initialCamera.zoomLevel}
                    centerCoordinate={initialCamera.centerCoordinate}
                />

                {!error && renderAnnotations()}

                {routeInfo && (
                    <MapboxGL.ShapeSource
                        id="route"
                        shape={{
                            type: 'Feature',
                            geometry: routeInfo.geometry,
                            properties: {}
                        }}
                    >
                        <MapboxGL.LineLayer
                            id="routeLine"
                            style={{
                                lineColor: 'blue',
                                lineWidth: 4,
                                lineOpacity: 0.7
                            }}
                        />
                    </MapboxGL.ShapeSource>
                )}
            </MapboxGL.MapView>

            {/* Controls Container */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[styles.controlButton, styles.searchButton]}
                    onPress={() => setShowSearchBar(!showSearchBar)}>
                    <FontAwesomeIcon icon={faSearch} size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.satelliteButton, { marginTop: 10 }]}
                    onPress={toggleMapStyle}>
                    <FontAwesomeIcon
                        icon={mapStyle === 'mapbox://styles/mapbox/streets-v11' ? faMap : faSatelliteDish}
                        size={16}
                        color="#fff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.filterButton, { marginTop: 10 }]}
                    onPress={() => setShowFilter(!showFilter)}>
                    <FontAwesomeIcon icon={faFilter} size={16} color="#fff" />
                </TouchableOpacity>

                {routeInfo && (
                    <TouchableOpacity
                        style={[styles.controlButton, styles.clearRouteButton]}
                        onPress={clearRoute}>
                        <FontAwesomeIcon icon={faTimes} size={16} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Modern Search Bar */}
            {showSearchBar && (
                <View style={styles.modernSearchContainer}>
                    <View style={styles.modernSearchBar}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            size={16}
                            color="#666"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.modernSearchInput}
                            placeholder="Search stores..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            onFocus={() => {
                                if (searchQuery.trim() !== '') {
                                    setShowSearchResults(true);
                                }
                            }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearSearch}
                            >
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    size={16}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Search Results */}
            {showSearchResults && filteredStores.length > 0 && (
                <ScrollView style={styles.searchResults}>
                    {filteredStores.map((store: Store, index) => (
                        <TouchableOpacity
                            key={store.store_id}
                            style={[
                                styles.searchResultItem,
                                index === filteredStores.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            onPress={() => handleStorePress(store)}
                        >
                            <Text style={styles.searchResultText}>{store.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Filter Modal */}
            <Modal
                visible={showFilter}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFilter(false)}>
                <View style={styles.filterModalOverlay}>
                    <View style={styles.filterModalContent}>
                        <View style={styles.filterModalHeader}>
                            <Text style={styles.filterModalTitle}>Filter Stores</Text>
                            <TouchableOpacity
                                style={styles.filterModalCloseButton}
                                onPress={() => setShowFilter(false)}>
                                <FontAwesomeIcon icon={faTimes} size={20} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.filterModalBody}>
                            <View style={styles.filterTypeContainer}>
                                {storeTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.filterTypeButton,
                                            selectedFilter === type && styles.filterTypeButtonSelected
                                        ]}
                                        onPress={() => filterStores(type)}>
                                        <Text style={[
                                            styles.filterTypeText,
                                            selectedFilter === type && styles.filterTypeTextSelected
                                        ]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.filterModalFooter}>
                            <TouchableOpacity 
                                style={styles.filterResetButton}
                                onPress={() => {
                                    filterStores('All');
                                    setShowFilter(false);
                                }}>
                                <Text style={styles.filterResetButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.filterApplyButton}
                                onPress={() => setShowFilter(false)}>
                                <Text style={styles.filterApplyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText]}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchStores}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <SpinningCubeLoader size={25} color={COLORS.secondary} />
                    <Text style={styles.loadingText}>Loading stores...</Text>
                </View>
            )}

            {renderStoreOverlay()}
            {renderLocationErrorModal()}
        </SafeAreaView>
    );
};

export default MapView;
