import { router, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TokenWithKeyScreen() {
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const { verified_token, key } = localParams;
  
  const token = Array.isArray(verified_token) ? verified_token[0] : verified_token;
  const keyValue = Array.isArray(key) ? key[0] : key;

  useEffect(() => {
    console.log('📍 TokenWithKeyScreen 마운트됨');
    console.log('📦 Local Params:', localParams);
    console.log('🌐 Global Params:', globalParams);
    console.log('🔑 Verified Token:', token);
    console.log('🗝️  Key:', keyValue);
  }, []);

  useEffect(() => {
    if (token && keyValue) {
      console.log('✅ 토큰과 키 수신 성공');
      console.log('   - Token:', token);
      console.log('   - Key:', keyValue);
      console.log('🏠 홈 화면으로 리다이렉션 중...');
      
      // 약간의 딜레이를 주어 로그를 확인할 수 있게 함
      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)',
          params: { 
            verified_token: token,
            key: keyValue
          }
        });
      }, 100);
    } else {
      console.log('❌ 토큰 또는 키가 없습니다');
      console.log('   - Token:', token || 'missing');
      console.log('   - Key:', keyValue || 'missing');
      console.log('🏠 홈 화면으로 리다이렉션 중...');
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [token, keyValue]);

  // 디버깅을 위해 잠깐 화면을 표시
  return (
    <View style={styles.container}>
      <Text style={styles.title}>토큰 + 키 처리 중...</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Token:</Text>
        <Text style={styles.value}>{token || 'No token'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Key:</Text>
        <Text style={styles.value}>{keyValue || 'No key'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});

