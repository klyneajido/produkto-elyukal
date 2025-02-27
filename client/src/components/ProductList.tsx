// ProductList.tsx
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import { useNavigation } from '@react-navigation/native';
import { Product, RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ProductListProps = {
  products: Product[];
};

const ProductList: React.FC<ProductListProps> = ({ products =[] }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  console.log('ProductList received products:', products); // Add this
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
            <View style={styles.starContainer}>
              <View style={styles.ratings}>
                <FontAwesomeIcon icon={faStar} color={COLORS.secondary} size={12} />
                <Text style={styles.starText}> {product.average_rating || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardText} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {product.address || 'Address not available'}
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
    backgroundColor: COLORS.lightgray,
    borderRadius: 4,
    padding: 2,
    opacity: 0.9,
  },
  starText: {
    color: COLORS.gray,
    fontSize: 12,
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
});

export default ProductList;