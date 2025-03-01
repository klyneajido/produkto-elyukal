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
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faSliders,
  faTimes,
  faCheckSquare,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { Product, ProductsProps } from '../../types/types';
import styles from '../assets/style/productStyle.js';
import ProductList from '../components/ProductList.tsx';
import { COLORS } from '../assets/constants/constant.ts';

const priceRanges = [
  { label: 'Under $50', value: 'under50', min: 0, max: 50 },
  { label: '$50 - $100', value: '50to100', min: 50, max: 100 },
  { label: 'Over $100', value: 'over100', min: 100, max: Infinity },
];

type SearchResult<T> = {
  item: T;
  distance: number;
  isSubstring: boolean;
};

function fuzzySearch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  maxDistanceRatio: number = 0.4 // Max edit distance as a ratio of longer string length
): SearchResult<T>[] {
  const lowerQuery = query.toLowerCase();
  console.log('Fuzzy search query:', lowerQuery);

  const levenshteinDistance = (s1: string, s2: string): number => {
    const m = s1.length;
    const n = s2.length;
    const matrix = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) matrix[i][0] = i;
    for (let j = 0; j <= n; j++) matrix[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deletion
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }
    return matrix[m][n];
  };

  const results = items
    .map((item) => {
      const text = getText(item).toLowerCase();
      const distance = levenshteinDistance(lowerQuery, text);
      const isSubstring = text.includes(lowerQuery);
      const maxLength = Math.max(lowerQuery.length, text.length);
      const normalizedDistance = distance / maxLength; // Normalize to 0-1 range
      return { item, distance, isSubstring, normalizedDistance };
    })
    .filter((result) => result.isSubstring || result.normalizedDistance <= maxDistanceRatio)
    .sort((a, b) => {
      // Prioritize substring matches, then normalized distance
      if (a.isSubstring && !b.isSubstring) return -1;
      if (!a.isSubstring && b.isSubstring) return 1;
      return a.normalizedDistance - b.normalizedDistance;
    });

  console.log('Fuzzy search results:', results.map(r => ({
    name: getText(r.item),
    distance: r.distance,
    normalizedDistance: r.normalizedDistance,
    isSubstring: r.isSubstring
  })));
  return results;
}

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
        setProducts(response.data.products || []);
        console.log('Fetched products:', response.data.products);
      } catch (e) {
        setError('Error fetching products');
        console.error(e);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const applyFilters = () => {
    let filteredProducts = [...products];
    console.log('Initial products for filtering:', filteredProducts);

    if (searchText) {
      const searchResults = fuzzySearch<Product>(
        searchText,
        filteredProducts,
        (product) => product.name,
        0.4 // Allow up to 40% edit distance
      );
      filteredProducts = searchResults.map((result) => result.item);
      console.log('After fuzzy search:', filteredProducts);
    }

    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedCategories.includes(product.category)
      );
      console.log('After category filter:', filteredProducts);
    }

    if (selectedPriceRange.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedPriceRange.some((range) => {
          const rangeObj = priceRanges.find((r) => r.value === range);
          return rangeObj && product.price >= rangeObj.min && product.price <= rangeObj.max;
        })
      );
      console.log('After price filter:', filteredProducts);
    }

    if (inStockOnly) {
      filteredProducts = filteredProducts.filter((product) => product.in_stock);
      console.log('After stock filter:', filteredProducts);
    }

    return filteredProducts;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedPriceRange([]);
    setInStockOnly(false);
  };

  const filteredProducts = applyFilters();
  console.log('Final filteredProducts:', filteredProducts);

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
            <FontAwesomeIcon icon={faSliders} size={20} color={COLORS.secondary} />
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
                  {categories.map((category) => (
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
                  {priceRanges.map((range) => (
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
          <ProductList products={filteredProducts} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Products;