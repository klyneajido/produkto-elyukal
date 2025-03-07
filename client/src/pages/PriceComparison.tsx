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
import { faStar, faTag, faBox, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RootStackParamList } from '../../types/types';

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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FDD700" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' }}>
                <TouchableOpacity onPress={goBack} style={{ marginRight: 16 }}>
                    <FontAwesomeIcon icon={faArrowLeft} size={20} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Price Comparison</Text>
            </View>

            <ScrollView style={{ padding: 16 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
                        {product.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>
                        Compare prices across {allProducts.length} stores
                    </Text>
                </View>

                {allProducts.length === 0 ? (
                    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                        No comparison data available
                    </Text>
                ) : (
                    <>
                        {bestDeal && (
                            <View style={{ padding: 16, backgroundColor: '#FFF9C4', borderRadius: 8, marginBottom: 20 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                                    Best Deal
                                </Text>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4CAF50' }}>
                                    ₱{bestDeal.price?.toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: 14, marginTop: 4 }}>
                                    at {bestDeal.store_name}
                                </Text>
                            </View>
                        )}

                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                                All Available Options
                            </Text>
                        </View>

                        {sortedProducts.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.id}-${index}`}
                                style={{
                                    padding: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#EEEEEE',
                                    backgroundColor: item.id === product.id ? '#F5F5F5' : 'transparent',
                                    borderRadius: 8,
                                    marginBottom: 8
                                }}
                                onPress={() => navigateToProductDetails(item)}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    {item.image_urls && item.image_urls.length > 0 && (
                                        <Image
                                            source={{ uri: item.image_urls[0] }}
                                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
                                        />
                                    )}

                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                                                    {item.store_name}
                                                </Text>
                                                {item.stores && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                        <FontAwesomeIcon icon={faStar} color="#FDD700" size={12} />
                                                        <Text style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>
                                                            {item.stores.rating || 'N/A'}
                                                        </Text>
                                                        <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                                                            {item.stores.type || 'Store'}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontWeight: 'bold',
                                                    color: item.id === bestDeal?.id ? '#4CAF50' : '#000'
                                                }}>
                                                    ₱{item.price?.toFixed(2)}
                                                </Text>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <FontAwesomeIcon icon={faBox} color="#666" size={12} />
                                                    <Text style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>
                                                        {item.in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {item.id === product.id && (
                                            <View style={{
                                                backgroundColor: '#EEEEEE',
                                                paddingVertical: 2,
                                                paddingHorizontal: 8,
                                                borderRadius: 4,
                                                alignSelf: 'flex-start',
                                                marginTop: 8
                                            }}>
                                                <Text style={{ fontSize: 12, color: '#666' }}>
                                                    Current Selection
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PriceComparison;