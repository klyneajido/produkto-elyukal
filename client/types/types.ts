import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Tabs: undefined;
  ProductDetails: { product: Product; reviews?: Review[] };
  Products: undefined;
  Reviews: { reviews: Review[]; product: Product };
  EventDetails: { eventId: string };
  StoreDetails: { store: Store };
  MapView: {longitude: number, latitude:number}
};
export interface Review {
  id: number;
  username: string;
  comment: string;
  rating: number;
  created_at: string;
  product_id: number;
  user_id: string;
  full_name:string;
  review_text:string;
}
export interface Product {
  store_id: any;
  stores(stores: any): unknown;
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
  average_rating: number;
  total_reviews:number;
  reviews?: Review[];
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
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
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
}
export interface RouteInfo {
  geometry: any;
  duration: number;
  distance: number;
}
