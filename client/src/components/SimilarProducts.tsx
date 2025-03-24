import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faTag } from '@fortawesome/free-solid-svg-icons';
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
                console.error('Invalid products data:', response.data);
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
            console.error('Error fetching similar products:', err);
            setError('Failed to load similar products');
        } finally {
            setLoading(false);
        }
    };

    const navigateToProductDetails = (product: Product) => {
        navigation.navigate('ProductDetails', { product });
    };

    const increment_views = async (productId: number) => {
        try {
            const response = await axios.put(`${BASE_URL}/products/add_view_to_product/${productId}`)
            console.log("Incremented Successfully!")
        }
        catch (error: any) {
            console.log("Error in Incrementing Product: ", error.message)

        }
    }

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}

            onPress={() => {
                increment_views(item.id);
                navigateToProductDetails(item)
            }}
        >
            <Image
                source={{ uri: item.image_urls[0] || item.image_urls[1] }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.productMeta}>
                    <View style={styles.ratingContainer}>
                        <FontAwesomeIcon icon={faStar} color={COLORS.secondary} size={12} />
                        <Text style={styles.ratingText}>
                            {item.average_rating || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.priceContainer}>

                        <Text style={styles.priceText}>₱{item.price_min}+</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Loading similar products...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (similarProducts.length === 0) {
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
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    productCard: {
        width: 150,
        marginRight: 15,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontFamily: FONTS.semibold,
        marginBottom: 5,
        color: COLORS.black,
    },
    productMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    priceText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.medium - 1,
        color: COLORS.secondary,
        marginLeft: 4,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.lightgray,
        fontSize: 14,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: 14,
    },
});

export default SimilarProducts;