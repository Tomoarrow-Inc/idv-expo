import { ThemedText } from '@/components/themed-text';
import { extractTokenParams, logTokenParams, processTokenAndRedirect } from '@/utils/tokenHandler';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

// Expo go test 용 라우트
// ** tomo에선 쿼리 스트링으로 토큰 전달, 해당 라우트는 더 이상 사용하지 않음 **

/**
 * Path Parameter 방식 토큰 라우트 (레거시 호환용)
 * 
 * 사용 예시:
 * idvexpo://token/{verified_token}/{key}
 */
export default function TokenWithKeyScreen() {
  const params = useLocalSearchParams();
  const { token, key } = extractTokenParams(params);

  useEffect(() => {
    logTokenParams('TokenWithKeyScreen (Path Parameter 방식)', params, { token, key });
    
    // 공용 토큰 처리 함수 호출
    processTokenAndRedirect(token, key, 100);
  }, [token, key]);

  // 디버깅을 위해 잠깐 화면을 표시
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>토큰 처리 중...</ThemedText>
      <View style={styles.infoContainer}>
        <ThemedText style={styles.label}>Token:</ThemedText>
        <ThemedText style={styles.value} numberOfLines={2}>
          {token ? `${token.substring(0, 60)}...` : 'No token'}
        </ThemedText>
      </View>
      <View style={styles.infoContainer}>
        <ThemedText style={styles.label}>Key:</ThemedText>
        <ThemedText style={styles.value} numberOfLines={2}>
          {key ? `${key.substring(0, 60)}...` : 'No key'}
        </ThemedText>
      </View>
      <View style={styles.hintContainer}>
        <ThemedText style={styles.hint}>
          💡 Path Parameter 방식 (레거시){'\n'}
          권장: idvexpo://verify?token=...&key=...
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
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  hintContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
    width: '100%',
    maxWidth: 400,
  },
  hint: {
    fontSize: 11,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
});
