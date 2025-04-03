// PopularList.tsx - Updated with better error handling
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import { useNavigation } from '@react-navigation/native';
import { Product, RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BASE_URL } from '../config/config.ts';

const PopularList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/products/fetch_popular_products`);
        setProducts(response.data.products || []);
      } catch (e) {
        // Silent error handling - just log to console but don't show to user
        console.log("Error fetching popular products - showing empty state instead");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const increment_views = async (productId:number) => {
    try {
      await axios.put(`${BASE_URL}/products/add_view_to_product/${productId}`);
    }
    catch(error:any) {
      // Silent error handling - don't show error to user
      console.log("View increment failed silently");
    }
  };

  // Display loading state
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading products...</Text>
      </View>
    );
  }

  // Display empty state
  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No popular products available at the moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.productGrid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.card}
            onPress={() => {
              increment_views(product.id);
              navigation.navigate('ProductDetails', { product });
            }}
          >
            <Image
              source={{ uri: product.image_urls[0] }}
              style={styles.productImage}
              // Add default image fallback
              onError={() => console.log("Image load error - continuing silently")}
            />
            <View style={styles.starContainer}>
              <View style={styles.ratings}>
                <FontAwesomeIcon icon={faStar} color={"#FFD700"} size={12} />
                <Text style={styles.starText}> {product.average_rating || 'N/A'} ({product.total_reviews || 0})</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardText} numberOfLines={1}>
                {product.name || "Unnamed Product"}
              </Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {product.address || "No location available"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    right: 5
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

export default PopularList;