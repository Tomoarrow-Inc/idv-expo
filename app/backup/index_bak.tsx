import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGlobalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 실제 iPad 기기에서는 Mac의 실제 IP 주소를 사용해야 합니다
// Mac IP 확인: ifconfig | grep "inet " | grep -v 127.0.0.1
// const TARGET_URL = 'https://demo.tomopayment.com/'

// 포트 충돌 방지를 위해 다른 포트 사용 (Metro는 8082, 서버는 8080)
// const TARGET_URL = 'http://192.168.11.159:8080/idv/jp/launch?token=c80ca68407891241e02fa8535660bc294417c72eac35d683860fe3fc985ae251'
const TARGET_URL = 'http://192.168.11.159:8080/idv/us/launch?token=link-sandbox-508a26ad-a83e-4e21-b96f-7b81230717c4&url=exp://192.168.11.159:8081/'
// const TARGET_URL = 'http://127.0.0.1:8080/idv/jp/launch?token=f9b8f226ed4721d9ad81dd4e9bbad0daaa05ae08bbe372d7416238df9e83d1ca'

// 만약 위 URL이 작동하지 않으면 아래 URL 중 하나를 사용해보세요:
// 테스트 liquid launch url
// const TARGET_URL = 'https://integrated-app.stg-liquid-ekyc.com/?endpoint=https%3A%2F%2Fapplicantsdk-api.stg-liquid-ekyc.com&token=ce39f1a57e1b0eac7544aecb7bc9eea0f044ea025af24d2bf24558bd66da765b'; 

// webview 가능한 url들
// 테스트 plaid link url
// const TARGET_URL = 'http://127.0.0.1:8080/idv/us/launch?token=link-sandbox-65af9a9a-dd52-4171-b777-84b29e3a21d4'
// 테스트 plaid checking url
// const TARGET_URL = 'https://verify-sandbox.plaid.com/verify/idv_28gqY9obvp35sF?key=d2bd3efbfcf4a50205d32c5445b661b5'; 
// const TARGET_URL = 'https://www.google.com'; // 테스트용
// const TARGET_URL = 'https://httpbin.org/get'; // API 테스트용

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasReceivedToken, setHasReceivedToken] = useState(false);
  const isIOS = Platform.OS === 'ios';
  
  // 딥링크 파라미터 가져오기
  const searchParams = useGlobalSearchParams();
  const verifiedToken = searchParams.verified_token as string;
  
  // 이전 토큰 값을 추적하기 위한 ref
  const previousTokenRef = useRef<string | null>(null);

  // 로그 저장 함수
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  }, []);

  // 로그 공유 함수
  const shareLogs = useCallback(async () => {
    const logText = logs.join('\n');
    try {
      await Share.share({
        message: logText,
        title: '앱 로그',
      });
    } catch (error) {
      console.error('로그 공유 실패:', error);
    }
  }, [logs]);

  const openInBrowser = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(TARGET_URL);
      if (supported) {
        console.log('외부 브라우저에서 URL 열기:', TARGET_URL);
        await Linking.openURL(TARGET_URL);
        const browserName = isIOS ? 'Safari' : 'Chrome 또는 기본 브라우저';
        Alert.alert(
          '브라우저가 열렸습니다', 
          `${isIOS ? 'iOS' : 'Android'}에서는 ${browserName}가 열렸을 것입니다.\n완료 후 앱으로 돌아와주세요.`,
          [
            { text: '확인', style: 'default' }
          ]
        );
      } else {
        Alert.alert('오류', '이 URL을 열 수 없습니다.');
      }
    } catch (error) {
      console.error('브라우저 열기 오류:', error);
      Alert.alert('오류', '브라우저를 열 수 없습니다.');
    }
  }, [isIOS]);

  const openInRealSafari = useCallback(async () => {
    try {
      console.log('실제 Safari에서 URL 열기:', TARGET_URL);
      const result = await WebBrowser.openBrowserAsync(TARGET_URL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        dismissButtonStyle: 'cancel',
        readerMode: false,
      });
      console.log('브라우저 닫힘:', result);
      Alert.alert(
        '완료', 
        'Liquid eKYC 인증이 완료되었나요?',
        [
          { text: '네, 완료됨', style: 'default' },
          { text: '다시 시도', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('실제 Safari 열기 오류:', error);
      await openInBrowser();
    }
  }, [openInBrowser]);

  const openInRealBrowser = useCallback(async () => {
    try {
      console.log('실제 브라우저에서 URL 열기:', TARGET_URL);
      const result = await WebBrowser.openBrowserAsync(TARGET_URL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        showTitle: true,
        enableBarCollapsing: false,
        showInRecents: true,
      });
      console.log('브라우저 닫힘:', result);
      Alert.alert(
        '완료', 
        'Liquid eKYC 인증이 완료되었나요?',
        [
          { text: '네, 완료됨', style: 'default' },
          { text: '다시 시도', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('실제 브라우저 열기 오류:', error);
      await openInBrowser();
    }
  }, [openInBrowser]);

  const openTargetUrl = useCallback(async () => {
    setLoading(true);
    try {
      if (isIOS) {
        await openInRealSafari();
      } else {
        await openInRealBrowser();
      }
    } finally {
      setLoading(false);
    }
  }, [isIOS, openInRealSafari, openInRealBrowser]);

  // 앱 시작 시 로그 (한 번만 실행)
  useEffect(() => {
    addLog('🚀 앱이 시작되었습니다');
    addLog(`📱 플랫폼: ${Platform.OS}`);
    addLog(`🔍 전체 searchParams: ${JSON.stringify(searchParams)}`);
    
    if (verifiedToken) {
      addLog(`🎯 초기 실행 시 토큰 감지됨: ${verifiedToken}`);
      setHasReceivedToken(true);
    } else {
      addLog('⏳ 인증 대기 중... (브라우저에서 인증 완료 후 앱으로 돌아오세요)');
    }
  }, [addLog]); // searchParams 의존성 제거

  // 딥링크 파라미터 변경 감지 (실시간)
  useEffect(() => {
    // 토큰이 변경되었을 때만 처리
    if (verifiedToken && verifiedToken !== previousTokenRef.current) {
      addLog(`🎉 새로운 토큰이 도착했습니다!`);
      addLog(`🔑 verified_token: ${verifiedToken}`);
      addLog(`📏 토큰 길이: ${verifiedToken.length}자`);
      
      setHasReceivedToken(true);
      previousTokenRef.current = verifiedToken;
      
      // 여기서 토큰을 사용하여 필요한 작업 수행
      // 예: 서버에 토큰 검증, 사용자 상태 업데이트 등
      Alert.alert(
        '🎊 인증 완료!',
        `인증 토큰이 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken}`,
        [
          { 
            text: '확인', 
            style: 'default',
            onPress: () => addLog('✅ 사용자가 인증 완료를 확인했습니다')
          }
        ]
      );
    }
  }, [verifiedToken, addLog]);

  useEffect(() => {
    void openTargetUrl();
  }, [openTargetUrl]);

  return (
    <SafeAreaView style={styles.container}>
      {/* <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.browserButton, loading && styles.browserButtonDisabled]}
          onPress={() => void openTargetUrl()}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            🔗 실제 {isIOS ? 'Safari' : '브라우저'}에서 열기
          </ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.buttonDescription}>
          실제 {isIOS ? 'Safari' : 'Chrome 또는 기본 브라우저'} 앱에서 열어야 Liquid eKYC가 정상 작동합니다
        </ThemedText>
      </ThemedView>

      <View style={styles.urlContainer}>
        <ThemedText style={styles.urlText} numberOfLines={1}>
          {TARGET_URL}
        </ThemedText>
      </View> */}

      <ThemedView style={styles.placeholder}>
        <ThemedText style={styles.placeholderText}>
          브라우저가 자동으로 열리지 않았다면 위 버튼을 눌러 다시 시도해주세요.
        </ThemedText>
        
        {/* 인증 상태 표시 */}
        <ThemedView style={[styles.statusContainer, hasReceivedToken ? styles.statusSuccess : styles.statusWaiting]}>
          <ThemedText style={styles.statusTitle}>
            {hasReceivedToken ? '✅ 인증 완료' : '⏳ 인증 대기 중'}
          </ThemedText>
          <ThemedText style={styles.statusDescription}>
            {hasReceivedToken 
              ? '토큰이 성공적으로 받아졌습니다!' 
              : '브라우저에서 인증을 완료한 후 앱으로 돌아와주세요.'
            }
          </ThemedText>
        </ThemedView>
        
        {/* 딥링크 파라미터 표시 (디버깅용) */}
        {verifiedToken && (
          <ThemedView style={styles.tokenContainer}>
            <ThemedText style={styles.tokenLabel}>🔑 받은 토큰:</ThemedText>
            <ThemedText style={styles.tokenValue}>{verifiedToken}</ThemedText>
          </ThemedView>
        )}

        {/* 로그 표시 영역 */}
        <ThemedView style={styles.logContainer}>
          <ThemedText style={styles.logTitle}>📱 앱 로그</ThemedText>
          <ThemedText style={styles.logCount}>
            총 {logs.length}개의 로그
          </ThemedText>
          {logs.length > 0 && (
            <View style={styles.logList}>
              {logs.slice(-5).map((log, index) => (
                <ThemedText key={index} style={styles.logText} numberOfLines={1}>
                  {log}
                </ThemedText>
              ))}
              {logs.length > 5 && (
                <ThemedText style={styles.logText}>
                  ... 외 {logs.length - 5}개 더
                </ThemedText>
              )}
            </View>
          )}
          {logs.length > 0 && (
            <View style={styles.logActions}>
              <ThemedText style={styles.shareButton} onPress={shareLogs}>
                📤 로그 공유하기
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ThemedView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>브라우저를 여는 중...</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  browserButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  browserButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 1000,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
  },
  urlContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  urlText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
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
  logContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logTitle: {
    fontSize: 16,
    color: '#495057',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  logCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 12,
  },
  logList: {
    marginBottom: 12,
  },
  logText: {
    fontSize: 11,
    color: '#495057',
    fontFamily: 'monospace',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  logActions: {
    alignItems: 'center',
  },
  shareButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
});
