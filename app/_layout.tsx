import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { Colors } from '../constants/colors';
import PhoneFrame from '../components/PhoneFrame';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <PhoneFrame>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.secondary,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/[id]"
          options={{
            title: '',
            headerTransparent: true,
            headerTintColor: Colors.white,
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{ title: '' }}
        />
      </Stack>
      </PhoneFrame>
    </AppProvider>
  );
}
