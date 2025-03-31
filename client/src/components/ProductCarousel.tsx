import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS } from '../assets/constants/constant';
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

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  const renderItem = ({ item }: { item: MediaItem }) => (
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
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
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
    zIndex: 10,
  },
  productTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
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
});

export default ProductMediaCarousel;