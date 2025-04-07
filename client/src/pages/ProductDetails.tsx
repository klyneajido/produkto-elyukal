import React, { useState, useRef, RefObject, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    Image,
    Platform,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ViroARSceneNavigator,
    ViroARScene,
    ViroTrackingState,
    ViroTrackingStateConstants,
    Viro3DObject,
    ViroAmbientLight,
    ViroNode,
    ViroText,
    ViroQuad,
    ViroAnimations,
    ViroMaterials,
} from '@viro-community/react-viro';
import { COLORS } from '../assets/constants/constant';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCameraRetro, faStore, faStar, faTag, faBox, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PERMISSIONS, request } from 'react-native-permissions';
import * as Animatable from 'react-native-animatable';
import styles from '../assets/style/productDetailStyle';
import { ProductARSceneProps, RootStackParamList } from '../../types/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import ReviewList from '../components/ReviewList';
import axios from 'axios';
import { BASE_URL } from '../config/config';
import SimilarProducts from '../components/SimilarProducts';
import ProductMediaCarousel from '../components/ProductCarousel';

ViroAnimations.registerAnimations({
    fadeIn: {
        properties: { opacity: 1 },
        duration: 1000,
        delay: 500,
        easing: 'easeInOutQuad',
    },
});

ViroMaterials.createMaterials({
    backgroundMaterial: {
        diffuseColor: 'rgba(0, 0, 0, 0.7)',
        shininess: 1.0,
    },
    textBackground: {
        diffuseColor: 'rgba(0,0,0,0.8)',
        shininess: 0.3,
        bloomThreshold: 0.85,
        roughness: 1,
        metalness: 0.1,
    },
    textBorder: {
        diffuseColor: 'rgba(70, 70, 70, 0.9)',
        shininess: 0.5,
    },
});

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreDetails'>;

interface Store {
    store_id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    store_image: string | null;
    type: string | null;
    rating: number;
}
interface MediaItem {
    uri: string;
    type: 'image';
}

const ProductARScene: React.FC<ProductARSceneProps> = ({ product, onClose, onTakePhoto }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [showText, setShowText] = useState(false);
    const initialPosition: [number, number, number] = [0, -0.15, -0.2];
    const [position, setPosition] = useState<[number, number, number]>(initialPosition);
    const [scale, setScale] = useState<[number, number, number]>([0.21, 0.21, 0.21]);
    const [rotation, setRotation] = useState<[number, number, number]>([0, 45, 0]);
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState<{ x: number, y: number } | null>(null);
    const [isPinching, setIsPinching] = useState(false);
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);

    // Calculate text position based on current object scale
    const getTextPosition = (): [number, number, number] => {
        const heightOffset = 0.1 * scale[1];
        return [0, heightOffset, 0];
    };

    const getInfoTextPosition = (): [number, number, number] => {
        const heightOffset = 0.2 * scale[1];
        return [0, heightOffset, 0];
    };

    const onInitialized = (state: ViroTrackingState) => {
        setIsTracking(state === ViroTrackingStateConstants.TRACKING_NORMAL);
    };

    const onProductTap = () => {
        setShowText(!showText);
    };

    const onDrag = (dragToPos: any, source: any) => {
        if (source.state === 'ENDED') {
            setIsDragging(false);
            setLastDragPosition(null);
            return;
        }

        if (!lastDragPosition) {
            setLastDragPosition({ x: dragToPos[0], y: dragToPos[1] });
            setIsDragging(true);
            return;
        }

        const deltaX = dragToPos[0] - lastDragPosition.x;
        const deltaY = dragToPos[1] - lastDragPosition.y;

        setRotation(prevRotation => {
            let newYRotation = prevRotation[1] - deltaX * 100;
            let newXRotation = prevRotation[0] + deltaY * 100;
            newXRotation = Math.max(-30, Math.min(30, newXRotation));
            newYRotation = newYRotation % 360;
            if (newYRotation < 0) newYRotation += 360;
            return [newXRotation, newYRotation, prevRotation[2]];
        });

        setLastDragPosition({ x: dragToPos[0], y: dragToPos[1] });
    };

    const onDragEnd = () => {
        setIsDragging(false);
        setLastDragPosition(null);
    };

    // Function to truncate text if it exceeds a certain length
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Truncate description to 100 characters
    const truncatedDescription = truncateText(product.description || '', 600);
    const productInfoText = `${truncatedDescription}\n${product.in_stock ? 'Stock Available' : 'Sorry, Out of Stock'}\n₱${product.price?.toFixed(2)}`;

    return (
        <ViroARScene onTrackingUpdated={onInitialized}>
            <ViroAmbientLight color="#FFFFFF" intensity={1000} />
            <ViroNode position={position}>
                <ViroNode
                    position={[0, 0, 0]}
                    onDrag={onDrag}
                    dragType="FixedDistance"
                >
                    <Viro3DObject
                        source={{ uri: product.ar_asset_url }}
                        type="GLB"
                        position={[0, 0, -0.05]}
                        scale={scale}
                        rotation={rotation}
                        onClick={onProductTap}
                        onPinch={(pinchState, scaleFactor, source) => {
                            if (pinchState === 1) {
                                setIsPinching(true);
                            } else if (pinchState === 2) {
                                setScale(prevScale => {
                                    const newScale = prevScale.map(s => s * scaleFactor) as [number, number, number];
                                    return newScale.map(s => Math.max(0.05, Math.min(s, 0.5))) as [number, number, number];
                                });
                            } else if (pinchState === 3) {
                                setIsPinching(false);
                            }
                        }}
                        onError={(event) => console.error("3D Object Loading Error:", event)}
                    />

                    {!showText && (
                        <ViroNode
                            position={getTextPosition()}
                            transformBehaviors={['billboard']}
                            scale={[0.15 * scale[0], 0.15 * scale[1], 0.15 * scale[2]]}
                        >
                            <ViroText
                                text="Tap the product to view details"
                                position={[0, 0, 0]}
                                scale={[4, 4, 4]}
                                width={2}
                                height={2}
                                style={{
                                    fontSize: 12,
                                    color: '#FFFFFF',
                                    fontFamily: 'Arial',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    shadowOpacity: 0.7,
                                    shadowOffset: { width: 2, height: 2 },
                                }}
                                renderingOrder={1}
                                extrusionDepth={0}
                                textLineBreakMode="WordWrap"
                            />
                        </ViroNode>
                    )}

                    {showText && (
                        <ViroNode
                            position={getInfoTextPosition()}
                            transformBehaviors={['billboard']}
                            scale={[0.15 * scale[0], 0.15 * scale[1], 0.15 * scale[2]]}
                        >
                            <ViroQuad
                                position={[0, 7, -0.5]}
                                height={9}
                                width={9}
                                materials={["textBackground"]}
                            />
                            <ViroQuad
                                position={[0, 0.03, -0.095]}
                                height={0.1 * (productInfoText.split('\n').length + 0.5) + 0.005}
                                width={0.4 + 0.005}
                                materials={["textBorder"]}
                            />
                            <ViroText
                                position={[0, 3, -0.1]}
                                text={productInfoText}
                                scale={[4, 4, 4]}
                                width={2}
                                height={4}
                                style={{
                                    fontSize: 10,
                                    color: '#FFFFFF',
                                    fontFamily: 'Arial',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                }}
                                animation={{ name: 'fadeIn', run: true, loop: false }}
                                onClick={() => setShowText(false)}
                                textLineBreakMode="WordWrap"
                            />
                        </ViroNode>
                    )}
                </ViroNode>
            </ViroNode>
            {!isTracking && (
                <ViroText
                    text="Tracking not initialized. Move your device slowly."
                    position={[0, 0, -1]}
                    scale={[0.5, 0.5, 0.5]}
                    style={{
                        fontSize: 12,
                        color: '#FFFFFF',
                        fontFamily: 'Arial',
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                    transformBehaviors={['billboard']}
                />
            )}
        </ViroARScene>
    );
};

const mockMediaItems = [
    {
        uri: 'https://example.com/image1.jpg',
        type: 'image' as const,
        height: 300,
    },
    {
        uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'youtube' as const,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg',
        height: 300,
    },
    {
        uri: 'https://example.com/image2.jpg',
        type: 'image' as const,
        height: 300,
    },
];

const ProductDetails: React.FC = () => {
    const [showAR, setShowAR] = useState(false);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const [storeData, setStoreData] = useState<Store | null>(null);
    const [loadingStore, setLoadingStore] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const route = useRoute<ProductDetailsRouteProp>();
    const { product } = route.params;
    const navigation = useNavigation<NavigationProp>();
    const arNavigatorRef: RefObject<ViroARSceneNavigator> = useRef(null);

    const mediaItems: MediaItem[] = product.image_urls?.map((url: string) => ({
        uri: url,
        type: 'image' as const,
    })) || [];

    const fetchStoreData = async () => {
        if (!product.store_id) return;
        setLoadingStore(true);
        try {
            const response = await axios.get(`${BASE_URL}/stores/fetch_stores`);
            const stores = response.data;
            const matchingStore = stores.find((store: Store) => store.store_id === product.store_id);
            setStoreData(matchingStore || null);
        } catch (error) {
            setStoreData(null);
        } finally {
            setLoadingStore(false);
        }
    };

    const fetchSimilarProducts = async () => {
        setLoadingSimilar(true);
        try {
            const url = `${BASE_URL}/products/fetch_similar_products/${product.id}`;
            const response = await axios.get(url);
            setSimilarProducts(response.data.similar_products || []);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching similar products:', error.response?.status, error.response?.data);
            } else {
                console.error('Error fetching similar products:', error);
            }
            setSimilarProducts([]);
        } finally {
            setLoadingSimilar(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
        fetchSimilarProducts();
    }, [product.id, product.store_id]);

    const handleComparePrices = () => {
        console.log('Navigating with:', { product, similarProducts });
        navigation.navigate('PriceComparison', { product, similarProducts });
    };

    const toggleProductSelection = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

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
            Alert.alert('Permission Required', 'Please grant camera and storage permissions to take and save photos.');
            return;
        }
        if (!arNavigatorRef.current) {
            Alert.alert('Error', 'AR Scene Navigator is not initialized.');
            return;
        }
        try {
            setIsTakingPhoto(true);
            const photo = await arNavigatorRef.current._takeScreenshot(`${product.name}_AR`, true);
            if (photo?.url) {
                await CameraRoll.save(photo.url, { type: 'photo', album: 'AR Products' });
                Alert.alert('Success', 'Photo saved to gallery!');
            } else {
                throw new Error('No photo URL returned');
            }
        } catch (error: any) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to save photo: ' + error.message);
        } finally {
            setIsTakingPhoto(false);
        }
    };

    const navigateToStoreDetails = (store: Store) => {
        navigation.navigate('StoreDetails', { store });
    };

    if (showAR) {
        return (
            <View style={{ flex: 1 }}>
                <ViroARSceneNavigator
                    ref={arNavigatorRef}
                    initialScene={{ scene: () => <ProductARScene product={product} onClose={() => setShowAR(false)} onTakePhoto={takePhoto} /> }}
                    style={{ flex: 1 }}
                />
                <View style={styles.arButtonsContainer}>
                    <TouchableOpacity style={[styles.arButton, styles.cameraButton]} onPress={takePhoto} disabled={isTakingPhoto}>
                        <View style={styles.cameraButtonInner}>
                            {isTakingPhoto ? <ActivityIndicator color="white" /> : <View style={styles.cameraButtonInnerCircle} />}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowAR(false)}>
                        <FontAwesomeIcon icon={faCameraRetro} color="white" size={24} />
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const carouselProps = {
        mediaItems,
        initialIndex: 0,
        productName: product.name || 'Unnamed Product',
        averageRating: product.average_rating,
        totalReviews: product.total_reviews,
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Animatable.View animation="fadeIn" duration={1000}>
                    {mediaItems.length > 0 ? (
                        <ProductMediaCarousel
                            mediaItems={mediaItems}
                            initialIndex={0}
                            productName={product.name || 'Unnamed Product'}
                            averageRating={product.average_rating}
                            totalReviews={product.total_reviews}
                        />
                    ) : (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>No images available</Text>
                    )}
                </Animatable.View>
                <View style={styles.detailsContainer}>
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceText}>₱{product.price_min?.toFixed(2)} - ₱{product.price_max?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.stockRow}>
                            <FontAwesomeIcon icon={faBox} color="#FDD700" size={20} />
                            <Text style={styles.stockText}>{product.in_stock ? 'In stock' : 'Out of stock'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.arButton} onPress={() => setShowAR(true)}>
                        <FontAwesomeIcon icon={faCameraRetro} color="white" size={24} />
                        <Text style={styles.arButtonText}>View in AR</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.productDescription}>{product.description}</Text>

                    <View style={styles.disclaimerContainer}>
                        <Text style={styles.disclaimerText}>
                            Note: This app is for product showcase purposes only. Products cannot be purchased through this application.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Available At</Text>
                    {loadingStore ? (
                        <ActivityIndicator size="small" color="#FDD700" />
                    ) : !storeData ? (
                        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>No store information available.</Text>
                    ) : (
                        <TouchableOpacity style={styles.storeCard} onPress={() => navigateToStoreDetails(storeData)}>
                            <Image source={{ uri: storeData.store_image || 'https://via.placeholder.com/60' }} style={styles.storeImage} />
                            <View style={styles.storeInfoContainer}>
                                <Text style={styles.storeNameText}>{storeData.name}</Text>
                                <View style={styles.storeDetailsRow}>
                                    <FontAwesomeIcon icon={faStar} color="#FDD700" />
                                    <Text style={styles.storeRatingText}>{storeData.rating || 'N/A'}</Text>
                                    <Text style={styles.storeTypeText}>{storeData.type || 'Store'}</Text>
                                </View>
                            </View>
                            <FontAwesomeIcon icon={faStore} color="#FDD700" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.comparePricesSection}>
                        <Text style={styles.sectionTitle}>Compare Prices at Other Stores</Text>
                        {loadingSimilar ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        ) : similarProducts.length === 0 ? (
                            <View style={styles.noStoresContainer}>
                                <Text style={styles.noStoresText}>
                                    No other stores offer "{product.name}".
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.compareButton}
                                onPress={handleComparePrices}
                                activeOpacity={0.8}
                            >
                                <FontAwesomeIcon icon={faExchangeAlt} size={16} color={COLORS.white} style={styles.compareButtonIcon} />
                                <Text style={styles.compareButtonText}>
                                    Compare Prices ({similarProducts.length + 1} stores)
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ReviewList />
                    <View style={styles.similarContainer}>
                        <Text style={styles.sectionTitle}>Similar Products</Text>
                        <SimilarProducts currentProduct={product} limit={5} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;