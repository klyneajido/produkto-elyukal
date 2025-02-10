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
import { faMap, faSatelliteDish, faDirections, faClock, faRoad, faLocationDot, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
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

    const checkLocationServices = async () => {
        try {
            return userLocation !== null && isLocationPermissionGranted;
        } catch (err) {
            console.warn('Error checking location services:', err);
            return false;
        }
    };

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const granted = await MapboxGL.requestAndroidPermissions();
                setIsLocationPermissionGranted(granted);
                return granted;
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "PRODUKTO-ELYUKAL Location Permission",
                        message: "PRODUKTO-ELYUKAL needs access to your location " +
                            "to provide navigation services and show your position on the map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                setIsLocationPermissionGranted(isGranted);
                return isGranted;
            }
        } catch (err) {
            console.warn('Error requesting location permission:', err);
            setIsLocationPermissionGranted(false);
            return false;
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

    const handleStoreSelect = useCallback((store: Store) => {
        setSelectedStore(store);
        setRouteInfo(null);
        setShowSearchResults(false);
        setSearchQuery('');
        
        // Zoom in to the selected store
        if (cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: store.coordinate,
                zoomLevel: 16,
                animationDuration: 1000,
            });
        }
    }, []);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredStores([]);
            setShowSearchResults(false);
            return;
        }

        const filtered = storeLocations.filter(store => 
            store.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredStores(filtered);
        setShowSearchResults(true);
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

    const handleNavigatePress = async () => {
        if (!selectedStore) return;

        // Always show permission modal first when navigate is pressed
        setShowPermissionModal(true);
    };

    const handlePermissionResponse = async (granted: boolean) => {
        setShowPermissionModal(false);

        if (granted) {
            const hasPermission = await requestLocationPermission();
            if (hasPermission) {
                setIsLocationPermissionGranted(true);
                if (userLocation && selectedStore) {
                    await fetchRoute(selectedStore.coordinate);
                } else {
                    setShowLocationError(true);
                }
            }
        } else {
            setIsLocationPermissionGranted(false);
        }
    };

    const renderAnnotations = () => (
        storeLocations.map((store) => (
            <MapboxGL.MarkerView
                key={store.id}
                coordinate={store.coordinate}
                onPress={() => handleStoreSelect(store)}
            >
                <TouchableOpacity
                    onPress={() => handleStoreSelect(store)}
                    style={styles.annotationContainer}
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
                    onPress={() => {
                        setSelectedStore(null);
                        // setRouteInfo(null);
                    }}
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
                    centerCoordinate={selectedStore?.coordinate || initialCamera.centerCoordinate}
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

            {/* Search Button or Search Bar */}
            {!showSearchBar ? (
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearchButtonPress}
                >
                    <FontAwesomeIcon
                        icon={faSearch}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            ) : (
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
                        onPress={handleCloseSearch}
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
                            onPress={() => handleStoreSelect(store)}
                        >
                            <Text style={styles.searchResultText}>{store.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Satellite Toggle */}
            <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setMapStyle(current =>
                    current === 'mapbox://styles/mapbox/streets-v11'
                        ? 'mapbox://styles/mapbox/satellite-v9'
                        : 'mapbox://styles/mapbox/streets-v11'
                )}
            >
                <FontAwesomeIcon
                    icon={mapStyle.includes('satellite') ? faMap : faSatelliteDish}
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>

            {renderStoreOverlay()}
            {renderLocationErrorModal()}
            {renderPermissionModal()}
        </SafeAreaView>
    );
};

export default MapView;