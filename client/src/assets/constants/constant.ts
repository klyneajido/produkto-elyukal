//COLORS
export const COLORS:Record<string,string> = {
    primary: "#622677",
    secondary:"#FFD700",
    gold:"#EEBC1D",
    white:"#FEFEFE",
    black: "#000000",
    gray:"#727D73",
    lightgray:"#ECEBDE",
    container: "#F1F5F9", 
    accent: "#1E293B",   
    highlight: "#3498DB" 
}as const;

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