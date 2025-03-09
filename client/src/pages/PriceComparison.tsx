import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faTag, faBox, faArrowLeft, faCheckCircle, faShoppingCart, faPercent } from '@fortawesome/free-solid-svg-icons';
import { RootStackParamList } from '../../types/types';
import { styles } from '../assets/style/priceComparisonStyle';

type PriceComparisonRouteProp = RouteProp<RootStackParamList, 'PriceComparison'>;

const PriceComparison: React.FC = () => {
    const route = useRoute<PriceComparisonRouteProp>();
    const { product, similarProducts } = route.params;
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    useEffect(() => {
        console.log('Current product:', product);
        console.log('Similar products:', similarProducts);

        // Process the original product to match the similar products format
        const processedProduct = {
            ...product,
            store_name: product.stores?.name || 'Unknown Store'
        };

        // Process similar products to ensure they have store_name
        const processedSimilarProducts = similarProducts.map(p => ({
            ...p,
            store_name: p.stores?.name || 'Unknown Store'
        }));

        // Combine them
        const combinedProducts = [
            processedProduct,
            ...processedSimilarProducts
        ].filter(p => p && p.id); // Filter out any undefined items

        setAllProducts(combinedProducts);
    }, [product, similarProducts]);

    // Sort products by price
    const sortedProducts = [...allProducts].sort((a, b) => {
        const priceA = a.price || Number.MAX_VALUE;
        const priceB = b.price || Number.MAX_VALUE;
        return priceA - priceB;
    });

    const getBestDeal = () => {
        if (sortedProducts.length === 0) return null;
        return sortedProducts[0];
    };

    const bestDeal = getBestDeal();

    const navigateToProductDetails = (selectedProduct: any) => {
        navigation.navigate('ProductDetails', { product: selectedProduct });
    };

    const goBack = () => {
        navigation.goBack();
    };

    const calculateSavings = (product: any) => {
        if (!bestDeal || !product.price || bestDeal.id === product.id) return null;
        const savings = product.price - bestDeal.price;
        const savingsPercentage = (savings / product.price) * 100;
        return {
            amount: savings.toFixed(2),
            percentage: savingsPercentage.toFixed(0)
        };
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={styles.loadingIndicator.color} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color={styles.backButtonIcon.color} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Price Comparison</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.productInfoContainer}>
                    {product.image_urls && product.image_urls.length > 0 && (
                        <Image
                            source={{ uri: product.image_urls[0] }}
                            style={styles.productImage}
                        />
                    )}
                    <View style={styles.productNameContainer}>
                        <Text style={styles.productName}>
                            {product.name}
                        </Text>
                        <Text style={styles.comparisonText}>
                            Compare prices across {allProducts.length} stores
                        </Text>
                    </View>
                </View>

                {allProducts.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>
                            No comparison data available
                        </Text>
                    </View>
                ) : (
                    <>
                        {bestDeal && (
                            <View style={styles.bestDealContainer}>
                                <View style={styles.bestDealHeader}>
                                    <FontAwesomeIcon icon={faTag} size={16} color={styles.bestDealIcon.color} />
                                    <Text style={styles.bestDealHeaderText}>BEST DEAL</Text>
                                </View>
                                <View style={styles.bestDealContent}>
                                    <View style={styles.bestDealStoreInfo}>
                                        {bestDeal.image_urls && bestDeal.image_urls.length > 0 && (
                                            <Image
                                                source={{ uri: bestDeal.image_urls[0] }}
                                                style={styles.bestDealImage}
                                            />
                                        )}
                                        <View>
                                            <Text style={styles.bestDealStoreName}>
                                                {bestDeal.store_name}
                                            </Text>
                                            <View style={styles.bestDealRatingContainer}>
                                                <FontAwesomeIcon icon={faStar} size={12} color={styles.bestDealStarIcon.color} />
                                                <Text style={styles.bestDealRating}>
                                                    {bestDeal.stores?.rating || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.bestDealPriceContainer}>
                                        <Text style={styles.bestDealPriceLabel}>Price</Text>
                                        <Text style={styles.bestDealPrice}>
                                            ₱{bestDeal.price?.toFixed(2)}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.viewDealButton}
                                            onPress={() => navigateToProductDetails(bestDeal)}
                                        >
                                            <Text style={styles.viewDealButtonText}>View Deal</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.allOptionsContainer}>
                            <Text style={styles.allOptionsTitle}>
                                All Available Options
                            </Text>

                            {sortedProducts.map((item, index) => {
                                const savings = calculateSavings(item);

                                return (
                                    <TouchableOpacity
                                        key={`${item.id}-${index}`}
                                        style={[
                                            styles.storeCard,
                                            item.id === product.id && styles.selectedStoreCard
                                        ]}
                                        onPress={() => navigateToProductDetails(item)}
                                    >
                                        <View style={styles.storeCardContent}>
                                            {item.image_urls && item.image_urls.length > 0 && (
                                                <Image
                                                    source={{ uri: item.image_urls[0] }}
                                                    style={styles.storeImage}
                                                />
                                            )}

                                            <View style={styles.storeInfo}>
                                                <Text style={styles.storeName}>
                                                    {item.store_name}
                                                </Text>

                                                {item.stores && (
                                                    <View style={styles.storeRatingContainer}>
                                                        <FontAwesomeIcon icon={faStar} size={12} color={styles.storeStarIcon.color} />
                                                        <Text style={styles.storeRating}>
                                                            {item.stores.rating || 'N/A'}
                                                        </Text>
                                                        <Text style={styles.storeType}>
                                                            {item.stores.type || 'Store'}
                                                        </Text>
                                                    </View>
                                                )}

                                                <View style={styles.stockContainer}>
                                                    <FontAwesomeIcon
                                                        icon={faBox}
                                                        color={item.in_stock ? styles.inStockIcon.color : styles.outOfStockIcon.color}
                                                        size={12}
                                                    />
                                                    <Text style={[
                                                        styles.stockText,
                                                        item.in_stock ? styles.inStockText : styles.outOfStockText
                                                    ]}>
                                                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.priceInfoContainer}>
                                                <Text style={[
                                                    styles.storePrice,
                                                    item.id === bestDeal?.id && styles.bestDealStorePrice
                                                ]}>
                                                    ₱{item.price?.toFixed(2)}
                                                </Text>

                                                {item.id === bestDeal?.id && (
                                                    <View style={styles.bestPriceTag}>
                                                        <FontAwesomeIcon icon={faCheckCircle} size={12} color={styles.bestPriceTagIcon.color} />
                                                        <Text style={styles.bestPriceTagText}>Best Price</Text>
                                                    </View>
                                                )}

                                                {savings && (
                                                    <View style={styles.savingsContainer}>
                                                        <FontAwesomeIcon icon={faPercent} size={10} color={styles.savingsIcon.color} />
                                                        <Text style={styles.savingsText}>
                                                            Save {savings.percentage}% (₱{savings.amount})
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {item.id === product.id && (
                                            <View style={styles.currentSelectionBadge}>
                                                <Text style={styles.currentSelectionText}>
                                                    Current Selection
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PriceComparison;