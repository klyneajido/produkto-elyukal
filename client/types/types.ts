import { NavigatorScreenParams, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export type TabProps = {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onMomentumScrollEnd?: () => void;
};
export type TabsParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
  Maps:undefined;
};
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Maps: undefined;
  ForgotPassword: undefined;
  Tabs: NavigatorScreenParams<TabsParamList>;
  ProductDetails: { product: Product; reviews?: Review[] };
  Products: { category?: string } | undefined;
  Municipalities: undefined;
  Reviews: { reviews: Review[]; product: Product };
  EventDetails: { eventId: string };
  StoreDetails: { store: Store };
  MapView: { longitude: number, latitude: number };
  PriceComparison: { product: Product; similarProducts: any[] };
  MunicipalityDetail: { municipality: Municipality };
  Settings: undefined;
  EditProfile: undefined;
  PersonalInformation: undefined;
  PrivacySecurity: undefined;
  PasswordSettings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  RegionSettings: undefined;
  AboutApp: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DarkModeSettings: undefined;
};
export interface Review {
  id: number;
  username: string;
  comment: string;
  rating: number;
  created_at: string;
  product_id: number;
  user_id: string;
  full_name: string;
  review_text: string;
}
export interface Product {
  store_id: any;
  stores?: {
    name: string;
    store_id: number;
    latitude: number;
    longitude: number;
    store_image: string;
    type: string;
    rating: number;
    town: string;
  };
  id: number;
  name: string;
  description: string;
  category: string;
  price_min: number;
  price_max:number;
  location_name: string;
  address: string;
  latitude: string;
  longitude: string;
  ar_asset_url: string;
  image_urls: string[];
  in_stock: boolean;
  rating: number | null;
  average_rating: number;
  total_reviews: number;
  reviews?: Review[];
}
export interface ProductsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Products'>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onMomentumScrollEnd?: () => void;
}
export interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  category: string;
  description: string;
  image_url: string;
  entrance_fee: number;
}

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  profile: string;
}

export interface Highlight {
  id: string;
  event_id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProductARSceneProps {
  product: any;
  onClose: () => void;
  sceneNavigator?: any;
  onTakePhoto: () => Promise<void>;
}


export interface ProductsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Products'>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export interface Store {
  store_id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number;
  store_image: string | null;
  type: string | null;
  coordinate?: [number, number];
  operating_hours?: string;
  phone?: string;
}
export interface StoreDetailsProps {
  route: {
      params: {
          store: Store;
      };
  };
  navigation: any;
}
export interface RouteInfo {
  geometry: any;
  duration: number;
  distance: number;
}

export interface Municipality {
  id: string;
  name: string;
  image_url: string;
  description: string;
}

export interface MunicipalityProps {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onMomentumScrollEnd?: () => void;
}
