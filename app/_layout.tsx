import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AuthProvider } from '../context/AuthContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import PhoneFrame from '../components/PhoneFrame';
import DialogHost from '../components/AppDialog';

function RootNav() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <PhoneFrame>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.secondary,
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="listing/[id]"
            options={{
              title: '',
              headerTransparent: true,
              headerTintColor: colors.white,
            }}
          />
          <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="cart" options={{ title: 'Shporta ime' }} />
          <Stack.Screen name="notifications" options={{ title: 'Njoftimet' }} />
          <Stack.Screen name="settings" options={{ title: 'Cilësimet' }} />
          <Stack.Screen name="docs" options={{ title: 'Dokumentacioni' }} />
          <Stack.Screen name="category/[id]" options={{ title: '' }} />
          <Stack.Screen name="chat/[id]" options={{ title: '' }} />
          <Stack.Screen name="user/[id]" options={{ title: '' }} />
        </Stack>
        <DialogHost />
      </PhoneFrame>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AppProvider>
              <RootNav />
            </AppProvider>
          </NotificationsProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
