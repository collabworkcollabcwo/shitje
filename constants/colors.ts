export type Palette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  white: string;
  black: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  shadow: string;
};

export const lightColors: Palette = {
  primary: '#FF6B00',
  primaryDark: '#E05E00',
  primaryLight: '#FFF0E6',
  secondary: '#1A1A2E',
  accent: '#E94560',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Dark ("black") theme. Same keys as light so swapping the palette is enough.
// `white` stays pure white (it's used for text/icons on coloured buttons/badges);
// `surface` is what backgrounds switch to. A soft near-black, comfy on the eyes.
export const darkColors: Palette = {
  primary: '#FF7A1A',
  primaryDark: '#E05E00',
  primaryLight: '#33210F',
  secondary: '#F2F2F7',
  accent: '#FF5C77',
  background: '#0E0E12',
  surface: '#1A1A22',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#16161C',
    100: '#1E1E26',
    200: '#2A2A34',
    300: '#3A3A46',
    400: '#6E6E7C',
    500: '#9A9AAA',
    600: '#B6B6C4',
    700: '#D2D2DC',
    800: '#E6E6EC',
    900: '#F5F5F8',
  },
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  border: '#2A2A34',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

// Default export = light palette, so any module that still imports `Colors`
// directly keeps compiling and renders in the light theme.
export const Colors = lightColors;
