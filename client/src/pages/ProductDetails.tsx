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
    Modal,
    findNodeHandle,
    UIManager,
    Share,
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
import { faCameraRetro, faStore, faStar, faTag, faBox, faExchangeAlt, faShoppingCart, faShare, faEllipsis, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
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
import Svg, { Path } from 'react-native-svg';

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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const moreButtonRef = useRef<TouchableOpacity>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const handleMoreButtonPress = () => {
        if (moreButtonRef.current) {
            console.log("handle more pressed");
            const handle = findNodeHandle(moreButtonRef.current);
            if (handle) {
                console.log("found node handle");
                UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                    console.log("measured position:", { x, y, width, height, pageX, pageY });
                    setModalPosition({
                        top: pageY + height + 10,
                        left: pageX - 160 + width,
                    });
                    setIsModalVisible(true);
                });
            } else {
                console.log("no node handle found");
            }
        } else {
            console.log("no ref current");
        }
    };

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


const handleShare = async () =>{
    try{
      const result = await Share.share({
        message: "Check out this Product from La union!",
        title: "Produkto Elyu-kal"
      })
      setIsModalVisible(false);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    }
    catch (error){
        console.error('Error sharing:', error);
    }
}

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

                <Animatable.View
                    animation="fadeInUp"
                    duration={800}
                    delay={200}
                    style={styles.detailsContainer}>
                    {/* Price container */}
                    <View style={styles.pricingContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceText}>₱{product.price_min?.toFixed(2)} - ₱{product.price_max?.toFixed(2)}</Text>
                        </View>
                        <View style={styles.stockContainer}>
                            <FontAwesomeIcon
                                icon={faBox}
                                color={product.in_stock ? "#4CAF50" : "#F44336"}
                                size={16}
                            />
                            <Text style={styles.stockText}>
                                {product.in_stock ? 'In stock' : 'Out of stock'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.arButton} onPress={() => setShowAR(true)}>
                            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 10.2308L3.08495 7.02346M12 10.2308L20.9178 7.03406M12 10.2308V20.8791M5.13498 18.5771L10.935 20.6242C11.3297 20.7635 11.527 20.8331 11.7294 20.8608C11.909 20.8853 12.091 20.8853 12.2706 20.8608C12.473 20.8331 12.6703 20.7635 13.065 20.6242L18.865 18.5771C19.6337 18.3058 20.018 18.1702 20.3018 17.9269C20.5523 17.7121 20.7459 17.4386 20.8651 17.1308C21 16.7823 21 16.3747 21 15.5595V8.44058C21 7.62542 21 7.21785 20.8651 6.86935C20.7459 6.56155 20.5523 6.28804 20.3018 6.0732C20.018 5.82996 19.6337 5.69431 18.865 5.42301L13.065 3.37595C12.6703 3.23665 12.473 3.167 12.2706 3.13936C12.091 3.11484 11.909 3.11484 11.7294 3.13936C11.527 3.167 11.3297 3.23665 10.935 3.37595L5.13498 5.42301C4.36629 5.69431 3.98195 5.82996 3.69824 6.0732C3.44766 6.28804 3.25414 6.56155 3.13495 6.86935C3 7.21785 3 7.62542 3 8.44058V15.5595C3 16.3747 3 16.7823 3.13495 17.1308C3.25414 17.4386 3.44766 17.7121 3.69824 17.9269C3.98195 18.1702 4.36629 18.3058 5.13498 18.5771Z"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                            <Text style={styles.arButtonText}>View in AR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity ref={moreButtonRef} style={[styles.moreButton, { opacity: 0.6 }]} onPress={handleMoreButtonPress}>
                            <FontAwesomeIcon icon={faEllipsisV} size={16} color="#333333" />
                        </TouchableOpacity>
                    </View>

                    <Modal
                        transparent={true}
                        visible={isModalVisible}
                        animationType="none"
                        onRequestClose={() => setIsModalVisible(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <View style={[styles.optionsModal, { top: modalPosition.top, left: modalPosition.left }]}>
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={
                                       handleShare
                                    }
                                >
                                    <FontAwesomeIcon icon={faShare} size={14} color="#333333" />
                                    <Text style={styles.optionText}>Share</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.optionItem, { borderBottomWidth: 0 }]}
                                    onPress={() => {
                                        handleComparePrices();
                                        setIsModalVisible(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faExchangeAlt} size={14} color="#333333" />
                                    <Text style={styles.optionText}>
                                        Compare Prices {similarProducts.length > 0 ? `(${similarProducts.length + 1} stores)` : ''}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

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
                        <TouchableOpacity
                            style={styles.storeCard}
                            onPress={() => navigateToStoreDetails(storeData)}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: storeData.store_image || 'https://via.placeholder.com/60' }}
                                style={styles.storeImage}
                            />
                            <View style={styles.storeInfoContainer}>
                                <Text style={styles.storeNameText}>{storeData.name}</Text>
                                <View style={styles.storeDetailsRow}>
                                    <FontAwesomeIcon icon={faStar} color="#FDD700" size={12} />
                                    <Text style={styles.storeRatingText}>{storeData.rating || '0'}</Text>
                                    <Text style={styles.storeTypeText}>{storeData.type || 'Retail Store'}</Text>
                                </View>
                            </View>
                            <View style={styles.storeIconContainer}>
                                <FontAwesomeIcon icon={faStore} color="#FDD700" size={18} />
                            </View>
                        </TouchableOpacity>
                    )}
                    <View style={styles.similarContainer}>
                        <Text style={styles.sectionTitle}>Similar Products</Text>
                        <SimilarProducts currentProduct={product} limit={5} />
                    </View>
                    <View style={styles.reviewListContainer}>
                        <ReviewList />
                    </View>
                </Animatable.View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;