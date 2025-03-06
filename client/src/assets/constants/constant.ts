//COLORS
export const COLORS: Record<string, string> = {
    primary: "#622677", 
    secondary: "#FFC107", 
    gold: "#E0A800", 
    white: "#FFFFFF", 
    black: "#121212", 
    gray: "#6B7280",
    lightgray: "#E5E7EB",
    container: "#F3F4F6",
    accent: "#374151", 
    highlight: "#3B82F6" 
} as const;


//FONT SIZES
export const FONT_SIZE:Record<string,number> ={
    small:10,
    medium: 13,
    large:20,
    extraLarge:24,
} as const;

//FONTS
export const FONTS: Record<string,string> ={
    regular: 'OpenSans-Regular',
    light: 'OpenSans-Light',
    semibold:'OpenSans-Semibold',
    bold: 'OpenSans-Bold'
} as const;