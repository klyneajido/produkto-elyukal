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
    Modal,
    Alert
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faSatelliteDish, faDirections } from '@fortawesome/free-solid-svg-icons';
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

const MapView = () => {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [route, setRoute] = useState<any>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const mapRef = useRef(null);
    const locationRef = useRef<MapboxGL.Location | null>(null);

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

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const granted = await MapboxGL.requestAndroidPermissions();
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
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const fetchRoute = async (destination: [number, number]) => {
        if (!userLocation) return;

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
                setRoute(response.body.routes[0].geometry);
            }
        } catch (error) {
            console.error('Route fetching error', error);
        }
    };

    const handleLocationUpdate = (location: MapboxGL.Location) => {
        locationRef.current = location;
        const { coords } = location;
        setUserLocation([coords.longitude, coords.latitude]);
    };

    const handleStoreSelect = useCallback((store: Store) => {
        setSelectedStore(store);
        setRoute(null);
    }, []);

    const handleNavigatePress = () => {
        setShowPermissionModal(true);
    };

    const handlePermissionResponse = async (granted: boolean) => {
        setShowPermissionModal(false);
        if (granted) {
            const hasPermission = await requestLocationPermission();
            if (hasPermission) {
                if (selectedStore && userLocation) {
                    fetchRoute(selectedStore.coordinate);
                } else {
                    Alert.alert(
                        "Location Unavailable",
                        "Please make sure your location services are enabled."
                    );
                }
            }
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

    const renderStoreOverlay = () => {
        if (!selectedStore) return null;

        return (
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        setSelectedStore(null);
                        setRoute(null);
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
                    setRoute(null);
                }}
            >
                <MapboxGL.UserLocation
                    visible={true}
                    onUpdate={handleLocationUpdate}
                />

                <MapboxGL.Camera
                    zoomLevel={12}
                    centerCoordinate={selectedStore?.coordinate || initialCamera.centerCoordinate}
                />

                {renderAnnotations()}

                {route && (
                    <MapboxGL.ShapeSource
                        id="route"
                        shape={{
                            type: 'Feature',
                            geometry: route
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

            {renderPermissionModal()}
            {renderStoreOverlay()}
        </SafeAreaView>
    );
};

export default MapView;