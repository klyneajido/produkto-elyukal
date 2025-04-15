import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollViewProps } from 'react-native';
import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import { useNavigation } from '@react-navigation/native';
import { Product, RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BASE_URL } from '../config/config';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import throttle from 'lodash/throttle';

type ProductListProps = {
  products: Product[];
  onScroll?: ScrollViewProps['onScroll'];
};

const ProductCard = React.memo(({ product, onPress }: { product: Product; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <FastImage
      style={styles.productImage}
      source={{
        uri: product.image_urls[0],
        priority: FastImage.priority.normal,
      }}
      resizeMode={FastImage.resizeMode.cover}
      onError={() => console.log("Image load error - continuing silently")}
    />
    <View style={styles.starContainer}>
      <View style={styles.ratings}>
        <FontAwesomeIcon icon={faStar} color="#FFD700" size={12} />
        <Text style={styles.starText}> {product.average_rating || '0'} ({product.total_reviews || 0})</Text>
      </View>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardText} numberOfLines={1}>
        {product.name || "Unnamed Product"}
      </Text>
      <Text style={styles.locationText} numberOfLines={1}>
        {product.address || 'Address not available'}
      </Text>
    </View>
  </TouchableOpacity>
));

const ProductList: React.FC<ProductListProps> = ({ products = [], onScroll }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const increment_views = useMemo(
    () =>
      throttle(async (productId: number) => {
        try {
          await axios.put(`${BASE_URL}/products/add_view_to_product/${productId}`);
        } catch (error: any) {
          console.log("View increment failed silently");
        }
      }, 1000),
    []
  );

  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products available at the moment</Text>
      </View>
    );
  }

  const renderItem = ({ item: product }: { item: Product }) => (
    <ProductCard
      product={product}
      onPress={() => {
        increment_views(product.id);
        navigation.navigate('ProductDetails', { product });
      }}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={5}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  productGrid: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
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
    backgroundColor: COLORS.lightgray,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  emptyText: {
    fontSize: FONT_SIZE.medium,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});

export default ProductList;