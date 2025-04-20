import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config';
import { RootStackParamList, Product } from '../../types/types';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetails'>;

interface SimilarProductsProps {
    currentProduct: Product;
    limit?: number;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct, limit = 5 }) => {
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
        fetchSimilarProducts();
    }, [currentProduct.id]);

    const fetchSimilarProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetching products
            const response = await axios.get(`${BASE_URL}/products/fetch_products`);

            // Extract the products array from the response
            // Check if response.data has a products property
            if (!response.data || !response.data.products || !Array.isArray(response.data.products)) {
                console.log('Invalid products data:', response.data);
                setError('Failed to load similar products - invalid data format');
                setLoading(false);
                return;
            }

            const allProducts = response.data.products;

            // Filter products by the same category, excluding the current product
            let filtered = allProducts.filter((product: Product) =>
                product.category === currentProduct.category &&
                product.id !== currentProduct.id
            );

            // If not enough products from the same category, add some from the same store
            if (filtered.length < limit) {
                const storeProducts = allProducts.filter((product: Product) =>
                    product.store_id === currentProduct.store_id &&
                    product.id !== currentProduct.id &&
                    !filtered.some(p => p.id === product.id)
                );

                filtered = [...filtered, ...storeProducts].slice(0, limit);
            }

            // If still not enough, add random products
            if (filtered.length < limit) {
                const randomProducts = allProducts
                    .filter((product: Product) =>
                        product.id !== currentProduct.id &&
                        !filtered.some(p => p.id === product.id)
                    )
                    .slice(0, limit - filtered.length);

                filtered = [...filtered, ...randomProducts];
            }

            setSimilarProducts(filtered.slice(0, limit));
        } catch (err) {
            console.log('Error fetching similar products:', err);
            setError('Failed to load similar products');
        } finally {
            setLoading(false);
        }
    };

    const increment_views = async (productId: number) => {
        try {
            await axios.put(`${BASE_URL}/products/add_view_to_product/${productId}`);
            console.log("Incremented Successfully!");
        } catch (error: any) {
            // Silent error handling - don't show to user
            console.log("View increment failed silently");
        }
    };

    // Display loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading similar products...</Text>
            </View>
        );
    }

    // Display error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Display empty state when no products are available
    if (!similarProducts || similarProducts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No similar products found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={similarProducts}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        onPress={() => {
                            increment_views(item.id);
                            navigation.navigate('ProductDetails', { product: item });
                        }}
                    >
                        <Image
                            source={{ uri: item.image_urls[0] }}
                            style={styles.productImage}
                            onError={() => console.log("Image load error - continuing silently")}
                        />
                        <View style={styles.starContainer}>
                            <View style={styles.pricePill}>
                                <Text style={styles.pricePillText}>₱{item.price_min}+</Text>
                            </View>
                            <View style={styles.ratings}>
                                <FontAwesomeIcon icon={faStar} color="#FFD700" size={12} />
                                <Text style={styles.starText}> {item.average_rating || '0'} ({item.total_reviews || 0})</Text>
                            </View>
                        </View>

                        <View style={styles.cardContent}>
                            <Text style={styles.cardText} numberOfLines={1}>
                                {item.name || "Unnamed Product"}
                            </Text>

                            <Text style={styles.locationText} numberOfLines={1}>
                                {item.address || 'Address not available'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    productList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    card: {
        width: 150,
        height: 200,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: '70%',
        resizeMode: 'cover',
        backgroundColor: COLORS.lightgray, // Fallback background color
    },
    cardContent: {
        padding: 8,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 115,
        right: 5,
    },
    ratings: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 2,
        marginLeft:5,
        opacity: 0.9,
    },
    starText: {
        color: COLORS.gray,
        fontSize: FONT_SIZE.small,
        marginLeft: 4,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    locationText: {
        fontSize: FONT_SIZE.small,
        color: COLORS.gray,
        fontFamily: FONTS.regular,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.gray,
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    errorText: {
        color: 'red',
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.regular,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    emptyText: {
        fontSize: FONT_SIZE.medium,
        color: COLORS.gray,
        fontFamily: FONTS.regular,
        textAlign: 'center',
    },
    pricePill: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 4,
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
      },
      
      pricePillText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.medium,
      },
});

export default SimilarProducts;