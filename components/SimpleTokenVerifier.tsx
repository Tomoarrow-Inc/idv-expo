import { TokenValidationResult, validateToken } from '@/utils/tokenValidator';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

interface SimpleTokenVerifierProps {
  token: string;
  tokenKey: string; // key는 React 예약어이므로 tokenKey로 변경
  onVerificationComplete?: (result: TokenValidationResult) => void;
}

export default function SimpleTokenVerifier({ 
  token, 
  tokenKey, 
  onVerificationComplete 
}: SimpleTokenVerifierProps) {
  const [verificationResult, setVerificationResult] = useState<TokenValidationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (token && tokenKey) {
      verifyToken();
    }
  }, [token, tokenKey]);

  const verifyToken = async () => {
    setIsVerifying(true);
    
    try {
      console.log('========================================');
      console.log('🚀 SimpleTokenVerifier 시작');
      console.log('🔑 토큰:', token.substring(0, 50) + '...');
      console.log('🗝️  키:', tokenKey.substring(0, 50) + '...');
      console.log('========================================');
      
      const result = await validateToken(token, tokenKey);
      
      console.log('========================================');
      console.log('✅ 검증 완료:', result.isValid ? '성공' : '실패');
      console.log('📊 결과:', result);
      console.log('========================================');
      
      setVerificationResult(result);
      onVerificationComplete?.(result);

      if (!result.isValid) {
        Alert.alert(
          '토큰 검증 실패',
          result.error || '알 수 없는 오류가 발생했습니다.',
          [{ text: '확인', style: 'default' }]
        );
      }

    } catch (error: any) {
      console.error('토큰 검증 중 오류:', error);
      
      const errorResult: TokenValidationResult = {
        isValid: false,
        error: error.message || '토큰 검증 중 오류가 발생했습니다.',
      };

      setVerificationResult(errorResult);
      onVerificationComplete?.(errorResult);

      Alert.alert(
        '토큰 검증 오류',
        error.message || '알 수 없는 오류가 발생했습니다.',
        [{ text: '확인', style: 'default' }]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>토큰 검증 중...</Text>
      </View>
    );
  }

  if (!verificationResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTokenText}>토큰이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusContainer, 
        verificationResult.isValid ? styles.statusSuccess : styles.statusError
      ]}>
        <Text style={styles.statusTitle}>
          {verificationResult.isValid ? '✅ 토큰 검증 성공' : '❌ 토큰 검증 실패'}
        </Text>
        
        {verificationResult.isValid ? (
          <View style={styles.successContent}>
            <Text style={styles.successText}>
              토큰이 유효합니다!
            </Text>
            
            {verificationResult.userId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>사용자 ID:</Text>
                <Text style={styles.infoValue}>{verificationResult.userId}</Text>
              </View>
            )}
            
            
            {verificationResult.expiresAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>만료시간:</Text>
                <Text style={styles.infoValue}>
                  {verificationResult.expiresAt.toLocaleString()}
                </Text>
              </View>
            )}
            
            {verificationResult.issuedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>발급시간:</Text>
                <Text style={styles.infoValue}>
                  {verificationResult.issuedAt.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>
              {verificationResult.error}
            </Text>
            
            {/* 디코딩된 정보가 있으면 표시 */}
            {verificationResult.decodedToken && (
              <View style={styles.decodedInfo}>
                <Text style={styles.decodedTitle}>📦 디코딩된 정보:</Text>
                <Text style={styles.decodedText}>
                  {JSON.stringify(verificationResult.decodedToken, null, 2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noTokenText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  statusError: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  decodedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  decodedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  decodedText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
});
