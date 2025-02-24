import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
    Platform,
    ActivityIndicator
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faStar,
    faMapMarkerAlt,
    faStore,
    faHeart,
    faCommentDots,
    faTag,
    faPesoSign,
    faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../assets/constants/constant';
import styles from '../assets/style/storeDetailsStyle';
import { BASE_URL } from '../config/config';
import axios from 'axios';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number | null;
    image_urls: string[];
    in_stock: boolean;
    rating: number | null;
    store_id: string;
}

interface Store {
    store_id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    rating: number | null;
    store_image: string | null;
    type: string | null;
}

interface StoreDetailsProps {
    route: {
        params: {
            store: Store;
        };
    };
    navigation: any;
}

const StoreDetails: React.FC<StoreDetailsProps> = ({ route, navigation }) => {
    const { store } = route.params;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStoreProducts();
    }, []);

    const fetchStoreProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/products/fetch_products`);
            if (response.data && response.data.products) {
                // Filter products by store_id
                const storeProducts = response.data.products.filter(
                    (product: Product) => product.store_id === store.store_id
                );
                setProducts(storeProducts);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const openMaps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${store.latitude},${store.longitude}`;
        const label = encodeURIComponent(store.name);
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) {
            Linking.openURL(url);
        }
    };

    const formatRating = (rating: number | null | undefined): string => {
        return rating ? rating.toFixed(1) : 'N/A';
    };

    const formatPrice = (price: number | null | undefined): string => {
        return price ? price.toFixed(2) : 'N/A';
    };

    const renderProductCard = (product: Product) => (
        <Animatable.View
            key={product.id}
            animation="fadeInUp"
            style={styles.productCard}
        >
            <Image
                source={
                    product.image_urls?.length > 0
                        ? { uri: product.image_urls[0] }
                        : require('../assets/img/events/culinary-arts.png')
                }
                style={styles.productImage}
                defaultSource={require('../assets/img/events/culinary-arts.png')}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>
                    {product.category || 'Uncategorized'}
                </Text>
                <View style={styles.productMetaContainer}>
                    <View style={styles.priceContainer}>
                        <FontAwesomeIcon icon={faPesoSign} size={14} color={COLORS.primary} />
                        <Text style={styles.productPrice}>
                            {formatPrice(product.price)}
                        </Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <FontAwesomeIcon icon={faStar} size={14} color="#FDD700" />
                        <Text style={styles.productRating}>
                            {formatRating(product.rating)}
                        </Text>
                    </View>
                </View>
                <Text
                    style={[styles.stockStatus,
                    { color: product.in_stock ? COLORS.success : COLORS.error }
                    ]}
                >
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </Text>
            </View>
        </Animatable.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <FontAwesomeIcon icon={faArrowLeft} size={24} color="#FFF" />
            </TouchableOpacity>
            <ScrollView>
                <Animatable.View animation="fadeIn" duration={1000} style={styles.headerContainer}>
                    {store.store_image ? (
                        <Image
                            source={{ uri: store.store_image }}
                            style={styles.storeImage}
                        />
                    ) : (
                        <View style={[styles.storeImage, styles.placeholderImage]}>
                            <FontAwesomeIcon icon={faStore} size={50} color={COLORS.lightGray} />
                        </View>
                    )}
                    <View style={styles.storeInfoOverlay}>
                        <Text style={styles.storeTitle}>{store.name}</Text>
                        <View style={styles.storeMetaContainer}>
                            <View style={styles.ratingContainer}>
                                <FontAwesomeIcon icon={faStar} color='#FDD700' size={16} />
                                <Text style={styles.ratingText}>
                                    {formatRating(store.rating)}
                                </Text>
                            </View>
                            {store.type && (
                                <View style={styles.typeContainer}>
                                    <FontAwesomeIcon icon={faTag} color='#FDD700' size={16} />
                                    <Text style={styles.typeText}>{store.type}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Animatable.View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.storeDescription}>{store.description || 'No description available'}</Text>

                    <Text style={styles.sectionTitle}>Location</Text>
                    <TouchableOpacity style={styles.locationContainer} onPress={openMaps}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} color='#FDD700' size={24} />
                        <Text style={styles.locationText}>View on Maps</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Products</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : products.length === 0 ? (
                        <View style={styles.emptyProductsContainer}>
                            <FontAwesomeIcon icon={faStore} size={50} color={COLORS.lightGray} />
                            <Text style={styles.emptyProductsText}>
                                Empty, this store doesn't have any products yet
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.productsContainer}>
                            {products.map(renderProductCard)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default StoreDetails;