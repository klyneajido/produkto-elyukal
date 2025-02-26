import { DefaultTheme, configureFonts } from 'react-native-paper';

type FontConfig = {
  [key: string]: {
    [key: string]: {
      fontFamily: string;
      fontWeight?: 'normal' | 'bold' | '500';
      fontSize?: number;
      letterSpacing?: number;
      lineHeight?: number;
    };
  };
};

const fontConfig: FontConfig = {
  default: {
    regular: {
      fontFamily: 'OpenSans-Regular',
      fontWeight: 'normal',
      fontSize: 14,
      letterSpacing: 0,
      lineHeight: 20,
    },
    medium: {
      fontFamily: 'OpenSans-Semibold',
      fontWeight: '500',
      fontSize: 14,
      letterSpacing: 0,
      lineHeight: 20,
    },
    bold: {
      fontFamily: 'OpenSans-Bold',
      fontWeight: 'bold',
      fontSize: 14,
      letterSpacing: 0,
      lineHeight: 20,
    },
  },
};

export const theme = {
  ...DefaultTheme,
  fonts: configureFonts({ config: fontConfig, isV3: true }),
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};