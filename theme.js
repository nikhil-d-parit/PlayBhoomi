import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Custom theme for admin panel with proper visibility
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2e7d32',        // Green (main brand color)
    secondary: '#66bb6a',      // Light green
    background: '#f5f5f5',     // Light gray background
    surface: '#ffffff',        // White surface
    text: '#000000',           // Black text
    onSurface: '#000000',      // Black text on surfaces
    onBackground: '#000000',   // Black text on background
    error: '#d32f2f',          // Red for errors
    success: '#2e7d32',        // Green for success
    outline: '#cccccc',        // Light gray outline
  },
};

export default theme;
