import React, { useState, useRef, useEffect, RefObject } from 'react';
import {
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    Image,
    Linking,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ViroARSceneNavigator, ViroARScene, ViroTrackingState, ViroARSceneNavigator as ViroARSceneNavigatorType } from '@viro-community/react-viro';
import {
    Viro3DObject,
    ViroAmbientLight,
    ViroNode,
    ViroTrackingStateConstants,
} from '@viro-community/react-viro';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCameraRetro,
    faLocation,
} from '@fortawesome/free-solid-svg-icons';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PERMISSIONS, request } from 'react-native-permissions';
import { faStar, faTag, faBox } from '@fortawesome/free-solid-svg-icons';
import * as Animatable from 'react-native-animatable';
import styles from '../assets/style/productDetailStyle';
import { Product, ProductARSceneProps, RootStackParamList } from '../../types/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import ReviewList from '../components/ReviewList';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const ProductARScene: React.FC<ProductARSceneProps> = ({ product, onClose, sceneNavigator, onTakePhoto }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [position] = useState<[number, number, number]>([0, 0, 0]);
    const [scale] = useState<[number, number, number]>([0.21, 0.21, 0.21]);
    const [rotation] = useState<[number, number, number]>([0, 0, 0]);

    const onInitialized = (state: ViroTrackingState) => {
        if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
            setIsTracking(true);
        } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
            setIsTracking(false);
        }
    };

    return (
        <ViroARScene onTrackingUpdated={onInitialized}>
            <ViroAmbientLight color="#FFFFFF" intensity={1000} />
            <ViroNode position={position}>
                <Viro3DObject
                    source={{ uri: product.ar_asset_url }}
                    type="GLB"
                    position={[0, -0.19, -0.2]}
                    scale={scale}
                    rotation={rotation}
                    onError={(event) => console.error("3D Object Loading Error:", event)}
                />
            </ViroNode>
        </ViroARScene>
    );
};

const ProductDetails: React.FC<Product> = () => {
    const [showAR, setShowAR] = useState(false);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const route = useRoute<ProductDetailsRouteProp>();
    const { product } = route.params;
    // Use the ViroARSceneNavigator type directly
    const arNavigatorRef: RefObject<ViroARSceneNavigatorType> = useRef(null);

    const requestCameraPermission = async () => {
        try {
            const permission = Platform.select({
                ios: PERMISSIONS.IOS.CAMERA,
                android: PERMISSIONS.ANDROID.CAMERA,
            });

            if (permission) {
                const result = await request(permission);
                return result === 'granted';
            }
            return false;
        } catch (err) {
            console.error('Error requesting camera permission:', err);
            return false;
        }
    };

    const requestStoragePermission = async () => {
        try {
            const permission = Platform.select({
                ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
                android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            });

            if (permission) {
                const result = await request(permission);
                return result === 'granted';
            }
            return false;
        } catch (err) {
            console.error('Error requesting storage permission:', err);
            return false;
        }
    };

    const takePhoto = async () => {
        if (isTakingPhoto) return;

        const hasCameraPermission = await requestCameraPermission();
        const hasStoragePermission = await requestStoragePermission();

        if (!hasCameraPermission || !hasStoragePermission) {
            Alert.alert(
                'Permission Required',
                'Please grant camera and storage permissions to take and save photos.'
            );
            return;
        }

        if (!arNavigatorRef.current) {
            Alert.alert('Error', 'AR Scene Navigator is not initialized.');
            return;
        }

        try {
            setIsTakingPhoto(true);
            console.log('Attempting to take screenshot...');
            // Use _takeScreenshot instead of arSceneNavigator.takeScreenshot
            const photo = await arNavigatorRef.current._takeScreenshot(
                `${product.name}_AR`,
                true
            );
            console.log('Screenshot result:', photo);

            if (photo?.url) {
                await CameraRoll.save(photo.url, {
                    type: 'photo',
                    album: 'AR Products'
                });
                Alert.alert('Success', 'Photo saved to gallery!');
            } else {
                throw new Error('No photo URL returned');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Screenshot aborted');
                Alert.alert('Error', 'Photo capture was aborted.');
            } else {
                console.error('Error taking photo:', error.message, error.stack);
                Alert.alert('Error', 'Failed to save photo: ' + error.message);
            }
        } finally {
            setIsTakingPhoto(false);
        }
    };

    const openMaps = () => {
        const address = encodeURIComponent(product.address);
        const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(url);
    };

    if (showAR) {
        return (
            <View style={{ flex: 1 }}>
                <ViroARSceneNavigator
                    ref={arNavigatorRef}
                    initialScene={{
                        scene: (props: any) => (
                            <ProductARScene
                                {...props}
                                product={product}
                                onClose={() => setShowAR(false)}
                                onTakePhoto={takePhoto}
                            />
                        ),
                    }}
                    style={{ flex: 1 }}
                />
                <View style={styles.arButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.arButton, styles.cameraButton]}
                        onPress={takePhoto}
                        disabled={isTakingPhoto}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cameraButtonInner}>
                            {isTakingPhoto ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View style={styles.cameraButtonInnerCircle} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowAR(false)}
                    >
                        <FontAwesomeIcon icon={faCameraRetro} color="white" size={24} />
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Animatable.View animation="fadeIn" duration={1000} style={styles.headerContainer}>
                    <Image
                        source={{ uri: product.image_urls[1] }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <View style={styles.productInfoOverlay}>
                        <Text style={styles.productTitle}>{product.name}</Text>
                        <View style={styles.productMetaContainer}>
                            <View style={styles.ratingContainer}>
                                <FontAwesomeIcon icon={faStar} color='#FDD700' size={16} />
                                <Text style={styles.ratingText}>
                                    {product.average_rating || 'N/A'} ({product.total_reviews || 0} reviews)
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animatable.View>

                <View style={styles.detailsContainer}>
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceRow}>
                            <FontAwesomeIcon icon={faTag} color='#FDD700' size={20} />
                            <Text style={styles.priceText}>₱{product.price?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.stockRow}>
                            <FontAwesomeIcon icon={faBox} color='#FDD700' size={20} />
                            <Text style={styles.stockText}>
                                {product.in_stock ? 'In stock' : 'Out of stock'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.arButton}
                        onPress={() => setShowAR(true)}
                    >
                        <FontAwesomeIcon icon={faCameraRetro} color='white' size={24} />
                        <Text style={styles.arButtonText}>View in AR</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>

                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>
                            Note: This app is for product showcase purposes only.
                            Products cannot be purchased through this application.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Shop Location</Text>
                    <TouchableOpacity style={styles.locationContainer} onPress={openMaps}>
                        <FontAwesomeIcon icon={faLocation} color='#FDD700' size={24} />
                        <Text style={styles.locationText}>{product.address}</Text>
                    </TouchableOpacity>

                    {/* Reviews Section */}
                    <ReviewList />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;