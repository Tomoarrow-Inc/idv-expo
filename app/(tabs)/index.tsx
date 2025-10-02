import SimpleTokenVerifier from '@/components/SimpleTokenVerifier';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { USER_CONFIG } from '@/utils/tokenConfig';
import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [receivedToken, setReceivedToken] = useState<string | null>(null);
  const [receivedKey, setReceivedKey] = useState<string | null>(null);
  
  // 전역 파라미터에서 토큰과 키 가져오기
  const searchParams = useGlobalSearchParams();
  const verifiedToken = Array.isArray(searchParams.verified_token) 
    ? searchParams.verified_token[0] 
    : searchParams.verified_token;
  const key = Array.isArray(searchParams.key) 
    ? searchParams.key[0] 
    : searchParams.key;

  // 토큰과 키 변경 감지
  useEffect(() => {
    if (verifiedToken && verifiedToken !== receivedToken) {
      console.log('🎯 토큰 수신됨:', verifiedToken);
      if (key) {
        console.log('🗝️  키 수신됨:', key);
      }
      setReceivedToken(verifiedToken);
      setReceivedKey(key || null);
      
      const message = key 
        ? `토큰과 키가 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken.substring(0, 50)}...\n키: ${key}`
        : `토큰이 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken.substring(0, 50)}...`;
      
      Alert.alert(
        '🎊 수신 완료!',
        message,
        [{ text: '확인', style: 'default' }]
      );
    }
  }, [verifiedToken, key, receivedToken]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ThemedView style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          딥링크 토큰 수신 테스트 앱
        </ThemedText>
        
        {/* 하드코딩된 사용자 정보 표시 */}
        <ThemedView style={styles.userInfoContainer}>
          <ThemedText style={styles.userInfoTitle}>👤 등록된 사용자 정보</ThemedText>
          <ThemedView style={styles.userInfoRow}>
            <ThemedText style={styles.userInfoLabel}>사용자 ID:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{USER_CONFIG.userId}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.userInfoRow}>
            <ThemedText style={styles.userInfoLabel}>사용자명:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{USER_CONFIG.userName}</ThemedText>
          </ThemedView>
        </ThemedView>
        
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
            {receivedKey && (
              <>
                <ThemedText style={[styles.tokenLabel, { marginTop: 12 }]}>🗝️ 받은 키:</ThemedText>
                <ThemedText style={styles.tokenValue}>{receivedKey}</ThemedText>
              </>
            )}
          </ThemedView>
        )}

        {/* 토큰 검증 컴포넌트 */}
        {receivedToken && (
          <ThemedView style={styles.verifierContainer}>
            <ThemedText style={styles.verifierTitle}>🔐 토큰 검증 (간소화 버전)</ThemedText>
            <SimpleTokenVerifier 
              token={receivedToken}
              tokenKey={receivedKey || 'default-key'} // 토큰과 키는 한 쌍이므로 필수
              onVerificationComplete={(result) => {
                console.log('🔍 검증 결과:', result);
              }}
            />
          </ThemedView>
        )}

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // 하단 여백 추가
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    minHeight: '100%', // 최소 높이 설정
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
  verifierContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    width: '100%',
  },
  verifierTitle: {
    fontSize: 16,
    color: '#495057',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  userInfoContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
    width: '100%',
  },
  userInfoTitle: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  userInfoValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
});
