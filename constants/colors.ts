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

// Hot, saturated brand orange + deep ink navy. Backgrounds are a whisper of
// cool gray so white cards "float"; accent is a punchy pink-red for badges.
export const lightColors: Palette = {
  primary: '#FF5500',
  primaryDark: '#E04800',
  primaryLight: '#FFEDE3',
  secondary: '#10122B',
  accent: '#FF2D55',
  background: '#F4F5F7',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFC',
    100: '#F2F3F5',
    200: '#E8E9EE',
    300: '#D9DBE2',
    400: '#A8ABB8',
    500: '#8A8D9C',
    600: '#62657A',
    700: '#494C61',
    800: '#2E3147',
    900: '#191B2E',
  },
  success: '#16A34A',
  warning: '#F5A623',
  error: '#EF4444',
  info: '#3B82F6',
  border: '#E8E9EE',
  shadow: 'rgba(16, 18, 43, 0.10)',
};

// Dark ("black") theme. Same keys as light so swapping the palette is enough.
// `white` stays pure white (it's used for text/icons on coloured buttons/badges);
// `surface` is what backgrounds switch to. Deep charcoal with a warm orange pop.
export const darkColors: Palette = {
  primary: '#FF6A1F',
  primaryDark: '#E04800',
  primaryLight: '#2E1A0B',
  secondary: '#F4F4F9',
  accent: '#FF4D67',
  background: '#0A0A0F',
  surface: '#16161E',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#121219',
    100: '#1C1C26',
    200: '#272732',
    300: '#363643',
    400: '#6C6F80',
    500: '#9A9DAD',
    600: '#B8BAC8',
    700: '#D4D6E0',
    800: '#E7E8EF',
    900: '#F5F5FA',
  },
  success: '#22C55E',
  warning: '#F5A623',
  error: '#F87171',
  info: '#60A5FA',
  border: '#272732',
  shadow: 'rgba(0, 0, 0, 0.55)',
};

// Default export = light palette, so any module that still imports `Colors`
// directly keeps compiling and renders in the light theme.
export const Colors = lightColors;
