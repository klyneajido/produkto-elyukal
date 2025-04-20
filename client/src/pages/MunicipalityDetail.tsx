// MunicipalityDetail.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    Share,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faShare,
    faHeart,
    faShoppingBag,
    faInfoCircle,
    faStar,
    faBoxOpen,
    faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import styles from '../assets/style/municipalityDetails.js';
import { COLORS } from '../assets/constants/constant.ts';
import { Municipality, Product } from '../../types/types.ts';
import Footer from '../components/Footer.tsx';



const MunicipalityDetail: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id: municipalityId, name: municipalityName, image_url: municipalityImage } = route.params;

    const [municipality, setMunicipality] = useState<Municipality | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!municipalityId) {
                setError('No municipality ID provided');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch municipality details
                const municipalityResponse = await axios.get(
                    `${BASE_URL}/municipalities/${municipalityId}`
                );
                setMunicipality(municipalityResponse.data);

                // Fetch products
                const productsResponse = await axios.get(
                    `${BASE_URL}/products/fetch_products_by_municipality/${municipalityId}`
                );
                const fetchedProducts = productsResponse.data.products || [];
                setProducts(fetchedProducts);
            } catch (err) {
                console.log('Error loading data:', err);
                setError('Failed to load data');
                Alert.alert(
                    'Error',
                    'Unable to load municipality data. Please check your connection and try again.',
                    [{ text: 'OK' }]
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [municipalityId]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out the amazing products from ${municipalityName} in our app!`,
            });
        } catch (err) {
            console.log('Share error:', err);
            Alert.alert('Error', 'Failed to share municipality products');
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    // Helper function to safely parse numeric values
    const parseNumericValue = (value: any): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    // Navigate to product detail
    const navigateToProductDetail = (product: Product) => {
        // Implement navigation to product detail screen
        console.log('Navigating to product:', product.name);
        // navigation.navigate('ProductDetail', { product });
    };

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
                <TouchableOpacity
                    style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 5 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ color: 'white' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={
                            municipalityImage
                                ? { uri: municipalityImage }
                                : require('../assets/img/events/culinary-arts.png')
                        }
                        style={styles.headerImage}
                        defaultSource={require('../assets/img/events/culinary-arts.png')}
                    />
                    <View style={styles.overlay} />
                    <View style={styles.navbar}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.navButton}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.navRight}>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={handleShare}
                            >
                                <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={toggleFavorite}
                            >
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    size={20}
                                    color={isFavorite ? COLORS.secondary : "#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>Municipality</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    <Text style={styles.title}>{municipalityName}</Text>

                    {/* Description Section (Improved) */}
                    {municipality && municipality.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>About {municipalityName}</Text>
                            <Text style={styles.descriptionText}>{municipality.description}</Text>
                        </View>
                    )}

                    {/* Products Section (Responsive 2 columns) */}
                    <View style={styles.productsContainer}>
                        <Text style={styles.sectionTitle}>Local Products</Text>

                        {products.length > 0 ? (
                            <View style={styles.productsGrid}>
                                {products.map((product, index) => {
                                    const averageRating = parseNumericValue(product.average_rating);
                                    const totalReviews = parseNumericValue(product.total_reviews);

                                    return (
                                        <TouchableOpacity
                                            key={product.id || `${product.store_id}-${index}`}
                                            style={styles.productCard}
                                            onPress={() => navigation.navigate('ProductDetails', { product })}
                                            activeOpacity={0.9}
                                        >
                                            {/* Product Image */}
                                            {product.image_urls && product.image_urls.length > 0 ? (
                                                <Image  
                                                    source={{ uri: product.image_urls[0] }}
                                                    style={styles.productImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.productImagePlaceholder}>
                                                    <FontAwesomeIcon icon={faShoppingBag} size={24} color={COLORS.gray} />
                                                    <Text style={styles.productImagePlaceholderText}>No Image</Text>
                                                </View>
                                            )}

                                            {/* Product Content */}
                                            <View style={styles.productContent}>
                                                <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
                                                    {product.name}
                                                </Text>
                                                {/* Rating */}
                                                <View style={styles.ratingContainer}>
                                                    <FontAwesomeIcon
                                                        icon={faStar}
                                                        size={14}
                                                        color={averageRating > 0 ? "#FFD700" : COLORS.gray}
                                                    />
                                                    <Text style={styles.ratingText}>
                                                        {averageRating > 0
                                                            ? `${averageRating.toFixed(1)} (${totalReviews})`
                                                            : 'No ratings yet'}
                                                    </Text>
                                                </View>
                                                {/* Price and Stock */}
                                                <View style={styles.productInfoRow}>
                                                    <Text style={styles.productPrice}>
                                                        ₱{product.price_min != null ? product.price_min.toFixed(2) : '0'}
                                                    </Text>

                                                    <View style={styles.stockBadge}>
                                                        <Text
                                                            style={product.in_stock ? styles.inStockText : styles.outOfStockText}
                                                        >
                                                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                                        </Text>
                                                    </View>
                                                </View>


                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.emptyProductsContainer}>
                                <View style={styles.emptyStateWrapper}>
                                    <View style={styles.emptyIconContainer}>
                                        <FontAwesomeIcon icon={faBoxOpen} size={32} color={COLORS.primary} />
                                        <View style={styles.locationPinWrapper}>
                                            <FontAwesomeIcon icon={faMapPin} size={16} color={COLORS.secondary} />
                                        </View>
                                    </View>
                                    <Text style={styles.emptyProductsTitle}>
                                        No Products Yet
                                    </Text>
                                    <Text style={styles.emptyProductsText}>
                                        We haven't discovered any products in {municipalityName} yet. Check back soon!
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.footerContainer}>
                    <Footer/>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MunicipalityDetail;
