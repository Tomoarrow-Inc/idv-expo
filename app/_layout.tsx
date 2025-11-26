// React Native에서 crypto.getRandomValues() 폴리필 추가 (uuid 라이브러리 지원)
import 'react-native-get-random-values';

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
        
        {/* IDV 검증 콜백 라우트 (권장) */}
        {/* IDV-app에 등록할 Redirect URI: idvexpo://verify */}
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        
        {/* 레거시 Path Parameter 방식 (하위 호환용) */}
        <Stack.Screen name="token/[verified_token]/[key]" options={{ headerShown: false }} />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
