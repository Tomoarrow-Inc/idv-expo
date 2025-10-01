import { router, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function TokenScreen() {
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const { verified_token } = localParams;
  const token = Array.isArray(verified_token) ? verified_token[0] : verified_token;

  useEffect(() => {
    console.log('📍 TokenScreen 마운트됨');
    console.log('📦 Local Params:', localParams);
    console.log('🌐 Global Params:', globalParams);
    console.log('🔑 Verified Token:', verified_token);
    console.log('🎯 Parsed Token:', token);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('✅ 토큰 수신 성공:', token);
      console.log('🏠 홈 화면으로 리다이렉션 중...');
      // 약간의 딜레이를 주어 로그를 확인할 수 있게 함
      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)',
          params: { verified_token: token }
        });
      }, 100);
    } else {
      console.log('❌ 토큰이 없습니다');
      console.log('🏠 홈 화면으로 리다이렉션 중...');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [token]);

  // 디버깅을 위해 잠깐 화면을 표시
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        토큰 처리 중...
      </Text>
      <Text style={{ fontSize: 12, color: '#666' }}>
        Token: {token || 'No token'}
      </Text>
    </View>
  );
}
