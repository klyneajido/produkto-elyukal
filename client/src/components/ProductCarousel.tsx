import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../assets/constants/constant';
import * as Animatable from 'react-native-animatable';

const { width: screenWidth } = Dimensions.get('window');

interface MediaItem {
  uri: string;
  type: 'image';
}

interface ProductMediaCarouselProps {
  mediaItems: MediaItem[];
  initialIndex?: number;
  productName: string;
  averageRating?: number;
  totalReviews?: number;
}

const ProductMediaCarousel: React.FC<ProductMediaCarouselProps> = ({
  mediaItems,
  initialIndex = 0,
  productName,
  averageRating,
  totalReviews,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);

  const carouselRef = useRef<FlatList>(null);

  // Log to verify props
  // console.log('ProductMediaCarousel Props:', { productName, averageRating, totalReviews });

  const handleNext = () => {
    if (activeIndex < mediaItems.length - 1) {
      setActiveIndex(activeIndex + 1);
      carouselRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      carouselRef.current?.scrollToIndex({ index: activeIndex - 1, animated: true });
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setActiveIndex(index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  const renderItem = ({ item }: { item: MediaItem }) => {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.uri }}
          style={styles.mediaItem}
          resizeMode="cover"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={COLORS.primary}
          />
        )}
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeIn" duration={800} style={styles.container}>
      <FlatList
        ref={carouselRef}
        data={mediaItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `media-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: styles.mediaItem.width,
          offset: styles.mediaItem.width * index,
          index,
        })}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />

      {/* Overlay with product info */}
      <View style={styles.productInfoOverlay}>
        <Text style={styles.productTitle}>{productName || 'No Name Provided'}</Text>
        <View style={styles.productMetaContainer}>
          <View style={styles.ratingContainer}>
            <FontAwesomeIcon icon={faStar} color="#FDD700" size={16} />
            <Text style={styles.ratingText}>
              {averageRating || 'N/A'} ({totalReviews || 0} reviews)
            </Text>
          </View>
        </View>
      </View>

      {mediaItems.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
            disabled={activeIndex === 0}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              color="white"
              size={20}
              style={{ opacity: activeIndex === 0 ? 0.5 : 1 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            disabled={activeIndex === mediaItems.length - 1}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              color="white"
              size={20}
              style={{ opacity: activeIndex === mediaItems.length - 1 ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </>
      )}

      {/* {mediaItems.length > 1 && (
        <View style={styles.pagination}>
          {mediaItems.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}
            />
          ))}
        </View>
      )}

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {activeIndex + 1} / {mediaItems.length}
        </Text>
      </View> */}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemContainer: {
    width: screenWidth,
    height: screenWidth * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaItem: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  loader: {
    position: 'absolute',
  },
  productInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 15,
    paddingBottom: 30,
    zIndex: 10, // Ensure overlay is above images
  },
  productTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold', // Replace with your FONTS.bold if different
    color: COLORS.white,
    marginBottom: 5,
  },
  productMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.white,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
  },
  counterContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 10,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductMediaCarousel;