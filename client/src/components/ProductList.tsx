import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS } from '../assets/constants/constant';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the Product type
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
  rating:number;
}


const ProductList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ProductDetails'>>();
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
  }, [])
  return (
    <View style={styles.productGrid}>
      {products.map((product) => (
        <TouchableOpacity style={styles.card}
        onPress={() => navigation.navigate('ProductDetails', { product })}>
          <Image
            style={styles.productImage}
            source={{uri: product.image_urls[0]}}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{product.name}</Text>
            <Text style={styles.locationText}>{product.address}</Text>
            <View style={styles.starContainer}>
              <FontAwesomeIcon
                icon={faStar}
                size={15}
                style={styles.star} 
              />
              <Text style={styles.starText}>{product.rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default ProductList

const styles = StyleSheet.create({
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
  elevation: 3, // For Android shadow
},
productImage: {
  width: '100%',
  height: '70%', // Adjust image height to leave space for text
  resizeMode: 'cover',
},
cardContent: {
  padding: 8,
  
},
star:{
  color:COLORS.secondary,
},
starContainer:{
  flexDirection:'row',
  marginTop:5,
},
starText:{
  color:COLORS.gray,
  fontSize:12
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
})