// Products.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  StyleSheet,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faSliders,
  faTimes,
  faCheckSquare,
  faSquare,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { COLORS } from '../assets/constants/constant';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, ProductsProps, RootStackParamList } from '../../types/types';
import styles from '../assets/style/productStyle.js';
import ProductList from '../components/ProductList.tsx';

const priceRanges = [
  { label: 'Under $50', value: 'under50', min: 0, max: 50 },
  { label: '$50 - $100', value: '50to100', min: 50, max: 100 },
  { label: 'Over $100', value: 'over100', min: 100, max: Infinity },
];

const Products: React.FC<ProductsProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/products/fetch_products`);
        setProducts(response.data.products);
      } catch (e) {
        setError('Error fetching products');
        console.error(e);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const applyFilters = () => {
    let filteredProducts = [...products];

    if (searchText) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    if (selectedPriceRange.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        selectedPriceRange.some(range => {
          const rangeObj = priceRanges.find(r => r.value === range);
          return rangeObj && product.price >= rangeObj.min && product.price <= rangeObj.max;
        })
      );
    }

    if (inStockOnly) {
      filteredProducts = filteredProducts.filter(product => product.in_stock);
    }

    return filteredProducts;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRange(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedPriceRange([]);
    setInStockOnly(false);
  };

  const filteredProducts = applyFilters();

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topHeader}>
          <View style={styles.searchBarContainer}>
            <FontAwesomeIcon
              icon={faSearch}
              size={16}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              onChangeText={setSearchText}
              value={searchText}
              placeholder="Search by product name"
              placeholderTextColor="#888"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <FontAwesomeIcon icon={faSliders} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal visible={showFilters} animationType="slide" transparent>
          <View style={styles.filterModal}>
            <View style={styles.filterContent}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <FontAwesomeIcon icon={faTimes} size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSubtitle}>Category</Text>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={styles.filterOption}
                      onPress={() => toggleCategory(category)}
                    >
                      <FontAwesomeIcon
                        icon={selectedCategories.includes(category) ? faCheckSquare : faSquare}
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.filterOptionText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSubtitle}>Price Range</Text>
                  {priceRanges.map(range => (
                    <TouchableOpacity
                      key={range.value}
                      style={styles.filterOption}
                      onPress={() => togglePriceRange(range.value)}
                    >
                      <FontAwesomeIcon
                        icon={selectedPriceRange.includes(range.value) ? faCheckSquare : faSquare}
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.filterOptionText}>{range.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSubtitle}>Availability</Text>
                  <TouchableOpacity
                    style={styles.filterOption}
                    onPress={() => setInStockOnly(!inStockOnly)}
                  >
                    <FontAwesomeIcon
                      icon={inStockOnly ? faCheckSquare : faSquare}
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.filterOptionText}>In Stock Only</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView style={styles.productContainer} showsVerticalScrollIndicator={false}>
            <ProductList />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


export default Products;