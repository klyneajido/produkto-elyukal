import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faStar,
    faStore,
    faTag,
    faPesoSign,
    faArrowLeft,
    faClock,
    faPhone,
    faChevronRight,
    faBoxOpen,
    faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../assets/constants/constant';
import styles from '../assets/style/storeDetailsStyle';
import { BASE_URL } from '../config/config';
import axios from 'axios';
import { Product, Store, StoreDetailsProps } from '../../types/types';


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
                const storeProducts = response.data.products.filter(
                    (product: Product) => product.store_id === store.store_id
                );
                setProducts(
                    storeProducts.map((product: Product) => ({
                        ...product,
                        // No need for parseFloat since average_rating is already a number
                        rating:
                            product.average_rating !== null &&
                                product.average_rating !== undefined &&
                                !isNaN(product.average_rating)
                                ? product.average_rating
                                : null,
                    }))
                );
            }
        } catch (err) {
            console.log('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const formatRating = (rating: number | null | undefined): string => {
        return typeof rating === 'number' && !isNaN(rating) && rating !== null && rating !== undefined
            ? rating.toFixed(1)
            : '0';
    };
    
    const formatPrice = (price_min: number | null | undefined): string => {
        return price_min ? price_min.toFixed(2) : '0';
    };

    const navigateToProductDetails = (product: Product) => {
        navigation.navigate('ProductDetails', { product });
    };

    const renderProductCard = (product: Product) => (
        <TouchableOpacity
            key={product.id}
            onPress={() => navigateToProductDetails(product)}
            activeOpacity={0.8}
        >
            <Animatable.View
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

                        <View style={styles.bottomContainer}>
                            <View style={styles.priceContainer}>
                                <FontAwesomeIcon icon={faPesoSign} size={14} color={COLORS.secondary} />
                                <Text style={styles.productPrice}>
                                    {formatPrice(product.price_min)}
                                </Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <FontAwesomeIcon icon={faStar} size={14} color="#FDD700" />
                                <Text style={styles.productRating}>
                                    {formatRating(product.rating)}
                                    {/* {product.total_reviews ? ` (${product.total_reviews} reviews)` : ''} */}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.stockStatus,
                                    { color: product.in_stock ? COLORS.success : COLORS.error },
                                ]}
                            >
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </Text>
                        </View>

                    </View>
                </View>
            </Animatable.View>
        </TouchableOpacity>
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
                                <FontAwesomeIcon icon={faStar} color="#FDD700" size={16} />
                                <Text style={styles.ratingText}>
                                    {formatRating(store.rating)}
                                </Text>
                            </View>
                            {store.type && (
                                <View style={styles.typeContainer}>
                                    <FontAwesomeIcon icon={faTag} color="#FDD700" size={16} />
                                    <Text style={styles.typeText}>{store.type}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Animatable.View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.storeDescription}>{store.description || 'No description available'}</Text>

                    <Text style={styles.sectionTitle}>Store Highlights</Text>
                    <View style={styles.highlightsContainer}>
                        <View style={styles.highlightsContent}>
                            {store.operating_hours ? (
                                <TouchableOpacity style={styles.highlightItem}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesomeIcon icon={faClock} color="#FFFFFF" size={18} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.highlightLabel}>HOURS</Text>
                                        <Text style={styles.highlightText}>{store.operating_hours}</Text>
                                    </View>
                                    <FontAwesomeIcon icon={faChevronRight} color="#DDD" size={16} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.highlightItemDisabled}>
                                    <View style={[styles.iconContainer, styles.iconDisabled]}>
                                        <FontAwesomeIcon icon={faClock} color="#FFFFFF" size={18} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.highlightLabel}>HOURS</Text>
                                        <Text style={styles.noHighlightText}>Not specified</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.divider} />

                            {store.phone ? (
                                <TouchableOpacity style={styles.highlightItem}>
                                    <View style={[styles.iconContainer, styles.phoneIcon]}>
                                        <FontAwesomeIcon icon={faPhone} color="#FFFFFF" size={18} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.highlightLabel}>CONTACT</Text>
                                        <Text style={styles.highlightText}>{store.phone}</Text>
                                    </View>
                                    <FontAwesomeIcon icon={faChevronRight} color="#DDD" size={16} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.highlightItemDisabled}>
                                    <View style={[styles.iconContainer, styles.phoneIcon, styles.iconDisabled]}>
                                        <FontAwesomeIcon icon={faPhone} color="#FFFFFF" size={18} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.highlightLabel}>CONTACT</Text>
                                        <Text style={styles.noHighlightText}>Not available</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Products</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : products.length === 0 ? (
                        <View style={styles.emptyProductsContainer}>
                            <View style={styles.emptyStateWrapper}>
                                <View style={styles.emptyIconContainer}>
                                    <FontAwesomeIcon icon={faBoxOpen} size={32} color={COLORS.primary} />
                                    <View style={styles.storeIconWrapper}>
                                        <FontAwesomeIcon icon={faShoppingBag} size={16} color={COLORS.secondary} />
                                    </View>
                                </View>
                                <Text style={styles.emptyProductsTitle}>
                                    No Products Listed
                                </Text>
                                <Text style={styles.emptyProductsText}>
                                    This store hasn't added any products to their catalog yet. Check back soon!
                                </Text>
                            </View>
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
