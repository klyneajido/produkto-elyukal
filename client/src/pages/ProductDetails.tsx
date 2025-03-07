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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCameraRetro, faStore, faStar, faTag, faBox } from '@fortawesome/free-solid-svg-icons';
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

const ProductARScene: React.FC<ProductARSceneProps> = ({ product, onClose, onTakePhoto }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [showText, setShowText] = useState(false);
    const initialPosition: [number, number, number] = [0, -0.15, -0.2];
    const [position] = useState<[number, number, number]>(initialPosition);
    const [scale] = useState<[number, number, number]>([0.21, 0.21, 0.21]);
    const [rotation] = useState<[number, number, number]>([0, 45, 0]);

    const onInitialized = (state: ViroTrackingState) => {
        setIsTracking(state === ViroTrackingStateConstants.TRACKING_NORMAL);
    };

    const onProductTap = () => {
        setShowText(!showText);
    };

    const productInfoText = `${product.description}\n${product.in_stock ? 'Stock Available' : 'Sorry, Out of Stock'}\n₱${product.price?.toFixed(2)}`;

    return (
        <ViroARScene onTrackingUpdated={onInitialized}>
            <ViroAmbientLight color="#FFFFFF" intensity={1000} />
            <ViroNode position={position}>
                <Viro3DObject
                    source={{ uri: product.ar_asset_url }}
                    type="GLB"
                    position={[0, 0, 0]}
                    scale={scale}
                    rotation={rotation}
                    onClick={onProductTap}
                    onError={(event) => console.error("3D Object Loading Error:", event)}
                />
                {!showText && (
                    <ViroText
                        text="Tap the product to view details"
                        position={[0, 0.1, 0]}
                        scale={[0.15, 0.15, 0.15]}
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
                        transformBehaviors={['billboard']}
                        renderingOrder={1}
                        extrusionDepth={0}
                        textLineBreakMode="WordWrap"
                    />
                )}
                {showText && (
                    <ViroNode position={[0, 0.2, 0]} transformBehaviors={['billboard']}>
                        <ViroQuad
                            position={[0, 0.03, -0.09]}
                            height={0.1 * (productInfoText.split('\n').length + 0.5)}
                            width={0.4}
                            materials={["textBackground"]}
                        />
                        <ViroQuad
                            position={[0, 0.03, -0.095]}
                            height={0.1 * (productInfoText.split('\n').length + 0.5) + 0.005}
                            width={0.4 + 0.005}
                            materials={["textBorder"]}
                        />
                        <ViroText
                            text={productInfoText}
                            scale={[0.15, 0.15, 0.15]}
                            width={2}
                            height={2}
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

    const fetchStoreData = async () => {
        if (!product.store_id) return;
        setLoadingStore(true);
        try {
            const response = await axios.get(`${BASE_URL}/stores/fetch_stores`);
            const stores = response.data;
            const matchingStore = stores.find((store: Store) => store.store_id === product.store_id);
            setStoreData(matchingStore || null);
        } catch (error) {
            console.error('Error fetching store data:', error);
            setStoreData(null);
        } finally {
            setLoadingStore(false);
        }
    };

    const fetchSimilarProducts = async () => {
        setLoadingSimilar(true);
        try {
            const url = `${BASE_URL}/products/fetch_similar_products/${product.id}`;
            console.log('Fetching similar products from:', url);
            const response = await axios.get(url);
            console.log('Response data:', response.data);
            setSimilarProducts(response.data.similar_products || []);
            console.log('Updated similarProducts state:', response.data.similar_products || []);
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
        console.log('Current product:', product);
        fetchStoreData();
        fetchSimilarProducts();
    }, [product.id, product.store_id]);

    const handleComparePrices = () => {
        console.log('Navigating with:', { product, similarProducts });
        navigation.navigate('PriceComparison', { product, similarProducts });
        console.log('Navigating with:', { product, similarProducts });
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Animatable.View animation="fadeIn" duration={1000} style={styles.headerContainer}>
                    <Image source={{ uri: product.image_urls[1] }} style={styles.productImage} resizeMode="cover" />
                    <View style={styles.productInfoOverlay}>
                        <Text style={styles.productTitle}>{product.name}</Text>
                        <View style={styles.productMetaContainer}>
                            <View style={styles.ratingContainer}>
                                <FontAwesomeIcon icon={faStar} color="#FDD700" size={16} />
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
                            <FontAwesomeIcon icon={faTag} color="#FDD700" size={20} />
                            <Text style={styles.priceText}>₱{product.price?.toFixed(2)}</Text>
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

                    <Text style={styles.sectionTitle}>Compare Prices at Other Stores</Text>
                    {loadingSimilar ? (
                        <ActivityIndicator size="small" color="#FDD700" />
                    ) : similarProducts.length === 0 ? (
                        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
                            No other stores offer "{product.name}".
                        </Text>
                    ) : (
                        <TouchableOpacity style={styles.compareButton} onPress={handleComparePrices}>
                            <Text style={styles.compareButtonText}>Compare Prices ({similarProducts.length + 1} stores)</Text>
                        </TouchableOpacity>
                    )}
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