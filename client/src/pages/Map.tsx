import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Image, Dimensions } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faSatelliteDish, faMapPin } from '@fortawesome/free-solid-svg-icons';
import styles from '../assets/style/mapStyle';

const screenWidth = Dimensions.get("window").width;

MapboxGL.setAccessToken('pk.eyJ1Ijoia2x5bmVhamlkbyIsImEiOiJjbTYzb2J0cmsxNWR5MmxyMHFzdHJkazl1In0.zxp6GI9_XeY0s1gxpwB4lg');

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
    const mapRef = useRef(null);

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

    const handleStoreSelect = useCallback((store: Store) => {
        setSelectedStore(store);
    }, []);

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

    const renderStoreOverlay = () => {
        if (!selectedStore) return null;

        return (
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedStore(null)}
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
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <MapboxGL.MapView
                ref={mapRef}
                style={styles.map}
                styleURL={mapStyle}
                onPress={() => setSelectedStore(null)}
            >
                <MapboxGL.Camera
                    defaultSettings={initialCamera}
                    zoomLevel={12}
                    centerCoordinate={initialCamera.centerCoordinate}
                />
                {renderAnnotations()}
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

            {renderStoreOverlay()}
        </SafeAreaView>
    );
};



export default MapView;