import { ThemedText } from '@/components/themed-text';
import { extractTokenParams, logTokenParams, processTokenAndRedirect } from '@/utils/tokenHandler';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * IDV-app 검증 완료 후 콜백 라우트
 * 
 * 사용 예시:
 * idvexpo://verify?token={verified_token}&key={public_key}
 * 
 * IDV-app에 등록할 Redirect URI: idvexpo://verify
 */
export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const { token, key } = extractTokenParams(params);

  useEffect(() => {
    logTokenParams('VerifyScreen (IDV 검증 콜백)', params, { token, key });
    
    // 공용 토큰 처리 함수 호출
    processTokenAndRedirect(token, key, 100);
  }, [token, key]);

  // 디버깅을 위해 잠깐 화면을 표시
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>🔐 IDV 검증 처리 중...</ThemedText>
      
      <View style={styles.infoContainer}>
        <ThemedText style={styles.label}>✅ 검증 완료</ThemedText>
        <ThemedText style={styles.description}>
          IDV-app에서 검증이 완료되었습니다.{'\n'}
          토큰과 키를 확인하고 있습니다...
        </ThemedText>
      </View>

      <View style={styles.dataContainer}>
        <ThemedText style={styles.dataLabel}>Token:</ThemedText>
        <ThemedText style={styles.dataValue} numberOfLines={2}>
          {token ? `${token.substring(0, 60)}...` : 'No token'}
        </ThemedText>
      </View>
      
      <View style={styles.dataContainer}>
        <ThemedText style={styles.dataLabel}>Key:</ThemedText>
        <ThemedText style={styles.dataValue} numberOfLines={2}>
          {key ? `${key.substring(0, 60)}...` : 'No key'}
        </ThemedText>
      </View>

      <View style={styles.redirectInfo}>
        <ThemedText style={styles.redirectText}>
          🏠 잠시 후 홈 화면으로 이동합니다...
        </ThemedText>
      </View>

      <View style={styles.hintContainer}>
        <ThemedText style={styles.hint}>
          💡 Redirect URI: idvexpo://verify
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  infoContainer: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#d4edda',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#28a745',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#155724',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#155724',
    textAlign: 'center',
    lineHeight: 18,
  },
  dataContainer: {
    marginVertical: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dataLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dataValue: {
    fontSize: 13,
    color: '#212529',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  redirectInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
    width: '100%',
    maxWidth: 400,
  },
  redirectText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 16,
  },
  hint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

