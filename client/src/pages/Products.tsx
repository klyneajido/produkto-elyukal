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
  Animated,
  ActivityIndicator,
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
  { label: 'Under ₱50', value: 'under50', min: 0, max: 50 },
  { label: '₱50 - ₱100', value: '50to100', min: 50, max: 100 },
  { label: 'Over ₱100', value: 'over100', min: 100, max: Infinity },
];

type SearchResult<T> = {
  item: T;
  distance: number;
  isSubstring: boolean;
};

function fuzzySearch<T>(
  query: string,
  items: T[],
  getFields: (item: T) => string[],
  maxDistanceRatio: number = 0.4
): SearchResult<T>[] {
  const lowerQuery = query.toLowerCase().trim();
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
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[m][n];
  };

  const results: SearchResult<T>[] = [];
  items.forEach((item) => {
    const fields = getFields(item)
      .filter((field) => field !== null && field !== undefined)
      .map((field) => field.toLowerCase().trim());

    let bestDistance = Infinity;
    let isSubstring = false;

    const isShortQuery = lowerQuery.length < 3;

    fields.forEach((field) => {
      if (field) {
        if (isShortQuery) {
          isSubstring = field.startsWith(lowerQuery);
        } else {
          const distance = levenshteinDistance(lowerQuery, field);
          const maxLength = Math.max(lowerQuery.length, field.length);
          const normalizedDistance = maxLength ? distance / maxLength : 1;
          const fieldIsSubstring = field.includes(lowerQuery);

          if (fieldIsSubstring) {
            isSubstring = true;
            bestDistance = 0;
          } else if (normalizedDistance < bestDistance) {
            bestDistance = normalizedDistance;
          }
        }
      }
    });

    if (isSubstring || (!isShortQuery && bestDistance <= maxDistanceRatio)) {
      results.push({
        item,
        distance: bestDistance,
        isSubstring,
      });
    }
  });

  results.sort((a, b) => {
    if (a.isSubstring && !b.isSubstring) return -1;
    if (!a.isSubstring && b.isSubstring) return 1;
    return a.distance - b.distance;
  });

  return results;
}

const Products: React.FC<ProductsProps> = ({ onScroll }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState(''); // New state for immediate input
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debouncing logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(inputText); // Update searchText after debounce
    }, 500); // 500ms debounce delay

    // Cleanup timeout on inputText change or component unmount
    return () => clearTimeout(handler);
  }, [inputText]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/products/fetch_products`);
        setProducts(response.data.products || []);
      } catch (e) {
        setProducts([]);
        console.error('Failed to fetch products:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const applyFilters = () => {
    let filteredProducts = [...products];

    if (searchText) {
      const searchResults = fuzzySearch<Product>(
        searchText,
        filteredProducts,
        (product) => {
          const fields = [
            product.name || '',
            product.stores?.name || '',
            product.stores?.town || '',
          ];
          console.log('Search fields for product:', {
            name: product.name,
            storeName: product.stores?.name,
            storeTown: product.stores?.town,
          });
          return fields;
        },
        0.4
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
          return rangeObj && product.price_min >= rangeObj.min && product.price_max <= rangeObj.max;
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
    setInputText(''); // Reset inputText as well
    setSelectedCategories([]);
    setSelectedPriceRange([]);
    setInStockOnly(false);
  };

  const filteredProducts = applyFilters();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topHeader}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>Discover Local Products</Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBarContainer}>
              <FontAwesomeIcon
                icon={faSearch}
                size={16}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchBar}
                onChangeText={setInputText} // Update inputText instead of searchText
                value={inputText} // Bind to inputText
                placeholder="Search by name, store, or town"
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
        </View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <>
            {/* Search Results Indicator */}
            {searchText ? (
              <View style={styles.resultsIndicator}>
                <Text style={styles.resultsText}>
                  Results for "{searchText}"
                </Text>
              </View>
            ) : null}

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

            <Animated.ScrollView
              style={styles.productContainer}
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              <ProductList products={filteredProducts} />
            </Animated.ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Products;