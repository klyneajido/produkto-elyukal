import React, { useState, useRef, useEffect } from 'react';
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
    ActivityIndicator
} from 'react-native';
import { ViroARSceneNavigator, ViroARScene } from '@viro-community/react-viro';
import {
    Viro3DObject,
    ViroAmbientLight,
    ViroNode,
    ViroTrackingStateConstants,
    ViroText
} from '@viro-community/react-viro';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCameraRetro,
    faLocation,
    faCaretDown,
    faWeightScale,
    faRuler,
    faCamera
} from '@fortawesome/free-solid-svg-icons';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PERMISSIONS, request } from 'react-native-permissions';
import { faStar, faTag, faBox } from '@fortawesome/free-solid-svg-icons';
import * as Animatable from 'react-native-animatable';
import styles from '../assets/style/productDetailStyle';
import axios from 'axios';

interface Review {
    id: number;
    user_id: string;
    review_text: string;
    rating: number;
    full_name: string;
}
interface ProductARSceneProps {
    product: any;
    onClose: () => void;
    sceneNavigator?: any;
    onTakePhoto: () => Promise<void>;
}

interface ProductDetailsProps {
    route: {
        params: {
            product: {
                id: number;
                name: string;
                description: string;
                category: string;
                price: number;
                location_name: string;
                address: string;
                latitude: string;
                longitude: string;
                ar_asset_url: string;
                image_urls: string[];
                in_stock: boolean;
                rating: number;
                reviews?: Review[];
            };
        };
    };
    navigation: any;
}

const ProductARScene: React.FC<ProductARSceneProps> = ({ product, onClose, sceneNavigator, onTakePhoto }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [position] = useState<[number, number, number]>([0, 0, 0]);
    const [scale] = useState<[number, number, number]>([0.21, 0.21, 0.21]);
    const [rotation] = useState<[number, number, number]>([0, 0, 0]);

    const onInitialized = (state: string) => {
        if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
            setIsTracking(true);
        } else if (state === ViroTrackingStateConstants.TRACKING_NONE) {
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

const ProductDetails: React.FC<ProductDetailsProps> = ({ route, navigation }) => {
    const [showAR, setShowAR] = useState(false);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const { product } = route.params;
    const arNavigatorRef = useRef(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://192.168.1.24:8000/reviews/${product.id}`);
                console.log(response.data);  // Check if this contains the expected array of reviews
                setReviews(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [product.id]);


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

        try {
            setIsTakingPhoto(true);
            const photo = await arNavigatorRef.current?.arSceneNavigator?.takeScreenshot(
                `${product.name}_AR`,
                true
            );

            if (photo?.url) {
                await CameraRoll.save(photo.url, {
                    type: 'photo',
                    album: 'AR Products'
                });
                Alert.alert('Success', 'Photo saved to gallery!');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to save photo');
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
                                    {product.rating || 'N/A'} ({product.reviewCount || 0} reviews)
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
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
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
                    <View>
    <Text style={styles.sectionTitle}>Reviews</Text>
    {loadingReviews ? (
        <ActivityIndicator size="small" color="#FDD700" />
    ) : reviews.length > 0 ? (
        reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
                <Text style={styles.reviewUsername}>{review.full_name}</Text>
                <Text style={styles.reviewComment}>{review.review_text}</Text>
                <View style={styles.starContainer}>
                    {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                        <FontAwesomeIcon
                            key={`${index}-${i}`}
                            icon={faStar}
                            size={12}
                            color="#FDD700"
                        />
                    ))}
                </View>
            </View>
        ))
    ) : (
        <Text>No reviews yet.</Text>
    )}
</View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;