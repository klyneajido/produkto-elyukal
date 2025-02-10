export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    Tabs: undefined;
    ProductDetails: { product: Product };
    Testenv: undefined;
  };
  
  export interface Product {
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
  }