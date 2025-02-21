  import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import axios from "axios";
  import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { COLORS, FONTS } from '../assets/constants/constant';
  import { useNavigation } from '@react-navigation/native';
  import { RootStackParamList } from '../../types/types';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';

  interface Review {
    id: number;
    username: string;
    comment: string; // Changed from `review_text` to match API
    rating: number;
    created_at: string;
    product_id: number;
    user_id: string;
  }
  
  

  interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    location_name: string;
    address: string;
    latitude: string;
    longitude: string;
    ar_asset_url: string;
    image_urls: string[];
    in_stock: boolean;
    rating: number;
    reviews?: Review[];
  }

  const ProductList = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get("http://192.168.1.24:8000/products/fetch_products");
          setProducts(response.data.products);
        } catch (e) {
          setError("Error fetching products");
          console.error(e);
        }
      };
      fetchProducts();
    }, []);

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
              onPress={() => navigation.navigate('ProductDetails', { product })}
            >
              <Image
                source={{ uri: product.image_urls[0] }}
                style={styles.productImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardText} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.locationText} numberOfLines={1}>
                  {product.address}
                </Text>
                <View style={styles.starContainer}>
                  <FontAwesomeIcon icon={faStar} color={COLORS.secondary} size={12} />
                  <Text style={styles.starText}> {product.rating || 'N/A'}</Text>
                </View>
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
      height: 250,
      backgroundColor: COLORS.white,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      width: '100%',
      height: '70%',
      resizeMode: 'cover',
    },
    cardContent: {
      padding: 8,
    },
    starContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    starText: {
      color: COLORS.gray,
      fontSize: 12,
      marginLeft: 4,
    },
    cardText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      fontFamily: FONTS.regular,
      marginBottom: 4,
    },
    locationText: {
      fontSize: 12,
      color: '#666',
      fontFamily: FONTS.regular,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
  });

  export default ProductList;