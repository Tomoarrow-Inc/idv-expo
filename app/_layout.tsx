import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
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

    // 초기 URL 확인
    Linking.getInitialURL().then(url => {
      console.log('🔗 초기 URL:', url);
    });

    // URL 변경 리스너
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔗 새로운 URL 수신:', url);
      const parsed = Linking.parse(url);
      console.log('📦 파싱된 URL:', parsed);
    });

    return () => {
      subscription.remove();
    };
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
        <Stack.Screen name="token/[verified_token]" options={{ headerShown: false }} />
        <Stack.Screen name="token/[verified_token]/[key]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
