import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const searchParams = useGlobalSearchParams();

  useEffect(() => {
    console.log('🚀 앱이 시작되었습니다');
    console.log('📱 플랫폼:', Platform.OS);
    console.log('🔍 전체 searchParams:', searchParams);
    
    // Expo Router가 자동으로 딥링크를 처리하므로 수동 Linking은 불필요
    // 필요시 searchParams를 통해 전달된 파라미터 확인 가능
  }, []);

  useEffect(() => {
    if (Object.keys(searchParams).length > 0) {
      console.log('🔄 searchParams 변경됨:', searchParams);
    }
  }, [searchParams]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="token/[verified_token]/[key]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
