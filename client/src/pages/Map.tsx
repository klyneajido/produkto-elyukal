import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Image,
    Dimensions,
    PermissionsAndroid,
    Platform,
    Linking,
    Modal,
    Alert,
    TextInput,
    ScrollView
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faSatelliteDish, faDirections, faClock, faRoad, faLocationDot, faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import styles from '../assets/style/mapStyle';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2x5bmVhamlkbyIsImEiOiJjbTYzb2J0cmsxNWR5MmxyMHFzdHJkazl1In0.zxp6GI9_XeY0s1gxpwB4lg';
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const directionsClient = MapboxDirections({ accessToken: MAPBOX_ACCESS_TOKEN });

interface Store {
    id: string;
    coordinate: [number, number];
    name: string;
    type: string;
    rating: number;
    image: any;
}

interface RouteInfo {
    geometry: any;
    duration: number;
    distance: number;
}

const MapView = () => {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
    const [showLocationError, setShowLocationError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const mapRef = useRef(null);
    const cameraRef = useRef<MapboxGL.Camera>(null);
    const searchInputRef = useRef<TextInput>(null);
    const locationRef = useRef<MapboxGL.Location | null>(null);
    const pendingStoreRef = useRef<Store | null>(null);
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);

    const storeLocations: Store[] = [
        {
            id: '1',
            coordinate: [120.33591510283381, 16.668377634915878],
            name: "Sukang Iloco Store",
            type: "Traditional",
            rating: 4.5,
            image: require('../assets/img/events/culinary-arts.png')
        },
        {
            id: '2',
            coordinate: [120.3259, 16.6179],
            name: "Vigan Basi Shop",
            type: "Wine Store",
            rating: 4.8,
            image: require('../assets/img/events/pottery.jpg')
        },
        {
            id: '3',
            coordinate: [120.3159, 16.6139],
            name: "Handcraft Center",
            type: "Artisan Store",
            rating: 4.2,
            image: require('../assets/img/handcraft.png')
        },
    ];

    const initialCamera = {
        centerCoordinate: [120.33591510283381, 16.668377634915878],
        zoomLevel: 12,
        pitch: 0,
        heading: 0
    };

    const storeTypes = ["All", "Traditional", "Wine Store", "Artisan Store"];

    const fetchRoute = async (destination: [number, number]) => {
        if (!userLocation || !isLocationPermissionGranted) return;

        try {
            const response = await directionsClient.getDirections({
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
            console.error('Route fetching error', error);
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
        // Clear route info when selecting a new store
        setRouteInfo(null);
        // Zoom to store with animation
        cameraRef.current?.setCamera({
            centerCoordinate: store.coordinate,
            zoomLevel: 15,
            animationDuration: 1000,
        });
    };

    const handleNavigatePress = async () => {
        if (!selectedStore) return;
        
        // Always show permission modal first when navigate is pressed
        setShowPermissionModal(true);
    };

    const handlePermissionResponse = async (granted: boolean) => {
        setShowPermissionModal(false);

        if (granted) {
            setIsLocationPermissionGranted(true);
            if (userLocation && selectedStore) {
                try {
                    const response = await directionsClient.getDirections({
                        profile: 'driving',
                        geometries: 'geojson',
                        waypoints: [
                            { coordinates: userLocation },
                            { coordinates: selectedStore.coordinate }
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
                    console.error('Error fetching route:', error);
                    Alert.alert('Error', 'Unable to fetch route. Please try again.');
                }
            } else {
                setShowLocationError(true);
            }
        } else {
            setIsLocationPermissionGranted(false);
            setShowLocationError(true);
        }
    };

    const handleCloseOverlay = () => {
        setSelectedStore(null);
        // Don't clear route info when closing overlay
    };

    const clearRoute = () => {
        setRouteInfo(null);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            // If search is empty, show all stores or respect current filter
            if (selectedFilter && selectedFilter !== "All") {
                setFilteredStores(storeLocations.filter(store => store.type === selectedFilter));
            } else {
                setFilteredStores(storeLocations);
            }
            setShowSearchResults(false);
            return;
        }

        const results = storeLocations.filter(store =>
            store.name.toLowerCase().includes(text.toLowerCase()) ||
            store.type.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredStores(results);
        setShowSearchResults(true);
    };

    const clearSearch = () => {
        setSearchQuery('');
        // Show all stores or respect current filter when clearing search
        if (selectedFilter && selectedFilter !== "All") {
            setFilteredStores(storeLocations.filter(store => store.type === selectedFilter));
        } else {
            setFilteredStores(storeLocations);
        }
        setShowSearchResults(false);
        setShowSearchBar(false);
    };

    const handleSearchButtonPress = () => {
        setShowSearchBar(true);
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    const handleCloseSearch = () => {
        setShowSearchBar(false);
        setShowSearchResults(false);
        setSearchQuery('');
        setFilteredStores([]);
    };

    const filterStores = (type: string | null) => {
        if (!type || type === "All") {
            setFilteredStores(storeLocations);
        } else {
            setFilteredStores(storeLocations.filter(store => store.type === type));
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

    useEffect(() => {
        setFilteredStores(storeLocations);
    }, []);

    useEffect(() => {
        if (selectedFilter && selectedFilter !== "All") {
            setFilteredStores(storeLocations.filter(store => store.type === selectedFilter));
        } else {
            setFilteredStores(storeLocations);
        }
    }, [selectedFilter]);

    useEffect(() => {
        const checkInitialPermission = async () => {
            if (Platform.OS === 'android') {
                try {
                    const result = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );
                    setIsLocationPermissionGranted(result);
                } catch (err) {
                    console.warn('Error checking initial permission:', err);
                }
            }
        };
        checkInitialPermission();
    }, []);

    const renderAnnotations = () => (
        filteredStores.map((store) => (
            <MapboxGL.MarkerView
                key={store.id}
                coordinate={store.coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
            >
                <TouchableOpacity
                    style={styles.annotationContainer}
                    onPress={() => handleStorePress(store)}
                >
                    <View style={styles.labelContainer}>
                        <Text style={styles.labelText}>{store.name}</Text>
                    </View>
                    <Image
                        source={store.image}
                        style={styles.annotationImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </MapboxGL.MarkerView>
        ))
    );

    const renderPermissionModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showPermissionModal}
            onRequestClose={() => setShowPermissionModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Location Permission Required</Text>
                    <Text style={styles.modalText}>
                        PRODUKTO-ELYUKAL needs access to your location to provide navigation services and show your position on the map.
                    </Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalButtonCancel]}
                            onPress={() => handlePermissionResponse(false)}
                        >
                            <Text style={styles.modalButtonText}>Deny</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalButtonAllow]}
                            onPress={() => handlePermissionResponse(true)}
                        >
                            <Text style={styles.modalButtonText}>Allow</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderLocationErrorModal = () => {
        if (!showLocationError) return null;

        return (
            <View style={styles.locationErrorModal}>
                <View style={styles.locationErrorContent}>
                    <TouchableOpacity
                        style={styles.locationErrorCloseButton}
                        onPress={() => setShowLocationError(false)}
                    >
                        <Text style={styles.locationErrorCloseText}>×</Text>
                    </TouchableOpacity>
                    <View style={styles.locationErrorIcon}>
                        <FontAwesomeIcon icon={faLocationDot} size={28} color="#FFF" />
                    </View>
                    <Text style={styles.locationErrorTitle}>Location Services Disabled</Text>
                    <Text style={styles.locationErrorMessage}>
                        Please enable location services in your device settings to use navigation features and see your current location on the map.
                    </Text>
                    <TouchableOpacity
                        style={styles.locationErrorButton}
                        onPress={() => {
                            Linking.openSettings();
                            setShowLocationError(false);
                        }}
                    >
                        <Text style={styles.locationErrorButtonText}>Open Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderStoreOverlay = () => {
        if (!selectedStore) return null;

        return (
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseOverlay}
                >
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                <Image
                    source={selectedStore.image}
                    style={styles.overlayImage}
                    resizeMode="cover"
                />
                <Text style={styles.overlayTitle}>{selectedStore.name}</Text>
                <Text style={styles.overlayType}>{selectedStore.type}</Text>
                <Text style={styles.overlayRating}>
                    Rating: {selectedStore.rating.toFixed(1)} ★
                </Text>
                {routeInfo && (
                    <View style={styles.routeInfoContainer}>
                        <View style={styles.routeInfoItem}>
                            <FontAwesomeIcon icon={faClock} size={20} color="#333" />
                            <Text style={styles.routeInfoText}>
                                {`${Math.round(routeInfo.duration / 60)} mins`}
                            </Text>
                        </View>
                        <View style={styles.routeInfoItem}>
                            <FontAwesomeIcon icon={faRoad} size={20} color="#333" />
                            <Text style={styles.routeInfoText}>
                                {`${(routeInfo.distance / 1000).toFixed(1)} km`}
                            </Text>
                        </View>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={handleNavigatePress}
                >
                    <FontAwesomeIcon icon={faDirections} size={24} color="#fff" />
                    <Text style={styles.navigateButtonText}>Navigate</Text>
                </TouchableOpacity>
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
                    zoomLevel={12}
                    centerCoordinate={initialCamera.centerCoordinate}
                />

                {renderAnnotations()}

                {routeInfo && (
                    <MapboxGL.ShapeSource
                        id="route"
                        shape={{
                            type: 'Feature',
                            geometry: routeInfo.geometry
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

            {/* Search, Theme, Filter, and Clear Route Controls */}
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
                    <FontAwesomeIcon icon={faFilter} size={16} color="#808080" />
                </TouchableOpacity>

                {/* Clear Route Button - only show when route is visible */}
                {routeInfo && (
                    <TouchableOpacity
                        style={[styles.controlButton, styles.clearRouteButton, { marginTop: 10 }]}
                        onPress={clearRoute}>
                        <FontAwesomeIcon icon={faTimes} size={16} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Bar */}
            {showSearchBar && (
                <View style={styles.searchContainer}>
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Search stores..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onFocus={() => {
                            if (searchQuery.trim() !== '') {
                                setShowSearchResults(true);
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={styles.searchCloseButton}
                        onPress={clearSearch}
                    >
                        <FontAwesomeIcon
                            icon={faTimes}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Search Results */}
            {showSearchResults && filteredStores.length > 0 && (
                <ScrollView style={styles.searchResults}>
                    {filteredStores.map((store, index) => (
                        <TouchableOpacity
                            key={index}
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
                animationType="fade"
                onRequestClose={() => setShowFilter(false)}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilter(false)}>
                    <View style={styles.filterContainer}>
                        {storeTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === type && styles.filterButtonSelected
                                ]}
                                onPress={() => filterStores(type)}>
                                <Text style={[
                                    styles.filterButtonText,
                                    selectedFilter === type && styles.filterButtonTextSelected
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {renderStoreOverlay()}
            {renderLocationErrorModal()}
            {renderPermissionModal()}
        </SafeAreaView>
    );
};

export default MapView;