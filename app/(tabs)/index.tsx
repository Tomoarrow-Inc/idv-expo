import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [receivedToken, setReceivedToken] = useState<string | null>(null);
  
  // 전역 파라미터에서 토큰 가져오기
  const searchParams = useGlobalSearchParams();
  const verifiedToken = Array.isArray(searchParams.verified_token) 
    ? searchParams.verified_token[0] 
    : searchParams.verified_token;

  // 토큰 변경 감지
  useEffect(() => {
    if (verifiedToken && verifiedToken !== receivedToken) {
      console.log('🎯 토큰 수신됨:', verifiedToken);
      setReceivedToken(verifiedToken);
      
      Alert.alert(
        '🎊 토큰 수신 완료!',
        `토큰이 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken.substring(0, 50)}...`,
        [{ text: '확인', style: 'default' }]
      );
    }
  }, [verifiedToken, receivedToken]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          딥링크 토큰 수신 테스트 앱
        </ThemedText>
        
        {/* 토큰 수신 상태 표시 */}
        <ThemedView style={[styles.statusContainer, receivedToken ? styles.statusSuccess : styles.statusWaiting]}>
          <ThemedText style={styles.statusTitle}>
            {receivedToken ? '✅ 토큰 수신 완료' : '⏳ 토큰 대기 중'}
          </ThemedText>
          <ThemedText style={styles.statusDescription}>
            {receivedToken 
              ? '토큰이 성공적으로 받아졌습니다!' 
              : '외부에서 딥링크로 토큰을 전달해주세요.'
            }
          </ThemedText>
        </ThemedView>
        
        {/* 토큰 표시 */}
        {receivedToken && (
          <ThemedView style={styles.tokenContainer}>
            <ThemedText style={styles.tokenLabel}>🔑 받은 토큰:</ThemedText>
            <ThemedText style={styles.tokenValue}>{receivedToken}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    width: '100%',
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  statusWaiting: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  tokenContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
