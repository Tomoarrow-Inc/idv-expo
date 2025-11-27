import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { updateUserId } from '@/utils/tokenConfig';
import { useGlobalSearchParams } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

export default function HomeScreen() {
  const [receivedToken, setReceivedToken] = useState<string | null>(null);
  const [receivedKey, setReceivedKey] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [userIdInput, setUserIdInput] = useState<string>(USER_CONFIG.userId);
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [isLoadingUS, setIsLoadingUS] = useState<boolean>(false);
  const [isLoadingUSProduct, setIsLoadingUSProduct] = useState<boolean>(false);
  const [isLoadingJP, setIsLoadingJP] = useState<boolean>(false);
  
  // 전역 파라미터에서 토큰과 키 가져오기
  const searchParams = useGlobalSearchParams();
  const verifiedToken = Array.isArray(searchParams.verified_token) 
    ? searchParams.verified_token[0] 
    : searchParams.verified_token;
  const key = Array.isArray(searchParams.key) 
    ? searchParams.key[0] 
    : searchParams.key;

  // 토큰과 키 변경 감지
  // 디버그 로그 추가 함수
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev.slice(-9), logMessage]); // 최근 10개만 유지
    console.log(logMessage);
  };

  // 문자열을 Base64Url로 인코딩하는 함수
  function encodeBase64Url(input: string): string {
    const utf8Bytes = typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(input)
      : Buffer.from(input, "utf-8");
    // base64 인코딩
    let base64 = '';
    if (typeof btoa !== "undefined") {
      // 브라우저 환경
      base64 = btoa(String.fromCharCode(...(utf8Bytes as Uint8Array)));
    } else if (typeof Buffer !== "undefined") {
      // Node & RN 환경
      base64 = Buffer.from(utf8Bytes).toString("base64");
    } else {
      throw new Error("No base64 encoding available");
    }
    // Base64Url로 변환 ('+', '/' → '-', '_', '=' 제거)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // 아래는 참고용 Base64Url 디코딩 함수
  /*
  function decodeBase64Url(base64Url: string): string {
    // base64url → base64 변환
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // '=' padding 추가
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    let binaryStr = "";
    if (typeof atob !== "undefined") {
      // 브라우저 환경
      binaryStr = atob(base64);
    } else if (typeof Buffer !== "undefined") {
      // Node & RN 환경
      binaryStr = Buffer.from(base64, "base64").toString("binary");
    } else {
      throw new Error("No base64 decoding available");
    }
    // 바이너리 → UTF-8 문자열
    if (typeof TextDecoder !== "undefined") {
      const bytes = new Uint8Array(Array.from(binaryStr).map(char => char.charCodeAt(0)));
      return new TextDecoder().decode(bytes);
    } else {
      // Fallback (정확하지 않을 수 있음)
      return decodeURIComponent(escape(binaryStr));
    }
  }
  */

  // 토큰 요청 함수
  // const handleRequestToken = async () => {
  //   setIsLoading(true);
  //   addDebugLog('🌐 토큰 요청 시작...');
    
  //   try {
  //     const response = await fetch('http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com/link_token', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     addDebugLog('✅ 서버 응답 수신됨');
      
  //     if (data.start_idv_uri) {
  //       addDebugLog('🔗 브라우저 열기: ' + data.start_idv_uri);
        
  //       // 브라우저로 URL 열기
  //       const result = await WebBrowser.openBrowserAsync(data.start_idv_uri, {
  //         presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
  //       });
        
  //       if (result.type === 'dismiss') {
  //         addDebugLog('📱 브라우저가 닫혔습니다');
  //       }
  //     } else {
  //       addDebugLog('❌ 응답에 start_idv_uri이 없습니다');
  //       Alert.alert('오류', '서버 응답에 start_idv_uri이 포함되어 있지 않습니다.');
  //     }
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
  //     addDebugLog('❌ 토큰 요청 실패: ' + errorMessage);
  //     Alert.alert(
  //       '요청 실패',
  //       `토큰을 요청하는 중 오류가 발생했습니다:\n${errorMessage}`,
  //       [{ text: '확인' }]
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 미국 인증 요청 함수
  const handleRequestUSToken = async () => {
    if (!userIdInput || userIdInput.trim() === '') {
      Alert.alert('입력 오류', 'User ID를 입력해주세요.');
      return;
    }

    // USER_CONFIG 업데이트
    updateUserId(userIdInput.trim());
    addDebugLog('👤 User ID 업데이트: ' + userIdInput.trim());

    setIsLoadingUS(true);
    addDebugLog('🇺🇸 미국 인증 요청 시작...');
    
    try {
      const uuid = uuidv4();
      addDebugLog('🆔 생성된 UUID: ' + uuid);
      
      // const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com/us/start?user_id=${userIdInput.trim()}`;
      const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com/start?user_id=${uuid}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=us`;
      // const url = `http://172.30.1.42:4300/start?user_id=${uuid}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=us`;
      addDebugLog('🌐 요청 URL: ' + url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addDebugLog('✅ 서버 응답 수신됨');
      
      if (data.start_idv_uri) {
        addDebugLog('🔗 브라우저 열기: ' + data.start_idv_uri);
        
        // 외부 브라우저로 URL 열기 (iOS Safari, Android Chrome)
        try {
          await Linking.openURL(data.start_idv_uri);
          addDebugLog('✅ 외부 브라우저로 열기 성공');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          addDebugLog('❌ 브라우저 열기 실패: ' + errorMessage);
          Alert.alert('오류', `브라우저를 열 수 없습니다:\n${errorMessage}`);
        }
        
        // 기존 WebBrowser 코드 (주석처리)
        // const result = await WebBrowser.openBrowserAsync(data.start_idv_uri, {
        //   presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        // });
        // if (result.type === 'dismiss') {
        //   addDebugLog('📱 브라우저가 닫혔습니다');
        // }
      } else {
        addDebugLog('❌ 응답에 start_idv_uri이 없습니다');
        Alert.alert('오류', '서버 응답에 start_idv_uri이 포함되어 있지 않습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      addDebugLog('❌ 미국 인증 요청 실패: ' + errorMessage);
      Alert.alert(
        '요청 실패',
        `미국 인증을 요청하는 중 오류가 발생했습니다:\n${errorMessage}`,
        [{ text: '확인' }]
      );
    } finally {
      setIsLoadingUS(false);
    }
  };

  // 미국 인증 요청 함수 (Prod)
  const handleRequestUSProductToken = async () => {
    if (!userIdInput || userIdInput.trim() === '') {
      Alert.alert('입력 오류', 'User ID를 입력해주세요.');
      return;
    }

    // USER_CONFIG 업데이트
    updateUserId(userIdInput.trim());
    addDebugLog('👤 User ID 업데이트: ' + userIdInput.trim());

    setIsLoadingUSProduct(true);
    addDebugLog('🇺🇸 미국 인증 요청 시작 (Prod)...');
    
    try {
      const uuid = uuidv4();
      addDebugLog('🆔 생성된 UUID: ' + uuid);
      // const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com:8080/us/start?user_id=${userIdInput.trim()}`;
      
      const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com:8080/start?user_id=${uuid}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=us`;
      // const url = `http://172.30.1.42:4300/start?user_id=${uuid}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=us`;
      addDebugLog('🌐 요청 URL: ' + url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addDebugLog('✅ 서버 응답 수신됨');
      
      if (data.start_idv_uri) {
        addDebugLog('🔗 브라우저 열기: ' + data.start_idv_uri);
        
        // 외부 브라우저로 URL 열기 (iOS Safari, Android Chrome)
        try {
          await Linking.openURL(data.start_idv_uri);
          addDebugLog('✅ 외부 브라우저로 열기 성공');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          addDebugLog('❌ 브라우저 열기 실패: ' + errorMessage);
          Alert.alert('오류', `브라우저를 열 수 없습니다:\n${errorMessage}`);
        }
        
        // 기존 WebBrowser 코드 (주석처리)
        // const result = await WebBrowser.openBrowserAsync(data.start_idv_uri, {
        //   presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        // });
        // if (result.type === 'dismiss') {
        //   addDebugLog('📱 브라우저가 닫혔습니다');
        // }
      } else {
        addDebugLog('❌ 응답에 start_idv_uri이 없습니다');
        Alert.alert('오류', '서버 응답에 start_idv_uri이 포함되어 있지 않습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      addDebugLog('❌ 미국 인증 요청 실패: ' + errorMessage);
      Alert.alert(
        '요청 실패',
        `미국 인증을 요청하는 중 오류가 발생했습니다:\n${errorMessage}`,
        [{ text: '확인' }]
      );
    } finally {
      setIsLoadingUSProduct(false);
    }
  };

  // 일본 인증 요청 함수
  const handleRequestJPToken = async () => {
    if (!userIdInput || userIdInput.trim() === '') {
      Alert.alert('입력 오류', 'User ID를 입력해주세요.');
      return;
    }

    // USER_CONFIG 업데이트
    updateUserId(userIdInput.trim());
    addDebugLog('👤 User ID 업데이트: ' + userIdInput.trim());

    setIsLoadingJP(true);
    addDebugLog('🇯🇵 일본 인증 요청 시작...');
    
    try {
      const encodedUserId = "0" + encodeBase64Url(userIdInput.trim());
      // const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com:8080/start?user_id=${userIdInput.trim()}&email=chanhee@tomoarrow.com&callback_url=idvexpo://verify&country=jp`;
      // const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com:8080/jp/start?user_id=${userIdInput.trim()};

      const url = `http://ec2-3-36-65-239.ap-northeast-2.compute.amazonaws.com/start?user_id=${encodedUserId}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=jp`;
      // const url = `http://172.30.1.42:4300/start?user_id=${encodedUserId}&email=${userIdInput.trim()}&callback_url=idvexpo://verify&country=jp`;
      addDebugLog('🌐 요청 URL: ' + url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addDebugLog('✅ 서버 응답 수신됨');
      
      if (data.start_idv_uri) {
        addDebugLog('🔗 브라우저 열기: ' + data.start_idv_uri);
        
        // 외부 브라우저로 URL 열기 (iOS Safari, Android Chrome)
        try {
          await Linking.openURL(data.start_idv_uri);
          addDebugLog('✅ 외부 브라우저로 열기 성공');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          addDebugLog('❌ 브라우저 열기 실패: ' + errorMessage);
          Alert.alert('오류', `브라우저를 열 수 없습니다:\n${errorMessage}`);
        }
        
        // 기존 WebBrowser 코드 (주석처리)
        // const result = await WebBrowser.openBrowserAsync(data.start_idv_uri, {
        //   presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        // });
        // if (result.type === 'dismiss') {
        //   addDebugLog('📱 브라우저가 닫혔습니다');
        // }
      } else {
        addDebugLog('❌ 응답에 start_idv_uri이 없습니다');
        Alert.alert('오류', '서버 응답에 start_idv_uri이 포함되어 있지 않습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      addDebugLog('❌ 일본 인증 요청 실패: ' + errorMessage);
      Alert.alert(
        '요청 실패',
        `일본 인증을 요청하는 중 오류가 발생했습니다:\n${errorMessage}`,
        [{ text: '확인' }]
      );
    } finally {
      setIsLoadingJP(false);
    }
  };

  useEffect(() => {
    if (verifiedToken && verifiedToken !== receivedToken) {
      // 기존 디버그 로그 주석처리
      // addDebugLog('🎯 토큰 수신됨: ' + verifiedToken.substring(0, 50) + '...');
      // if (key) {
      //   addDebugLog('🗝️  키 수신됨: ' + key.substring(0, 50) + '...');
      // }
      setReceivedToken(verifiedToken);
      setReceivedKey(key || null);

      // 기존 메시지 주석처리
      // const message = key
      //   ? `토큰과 키가 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken.substring(0, 50)}...\n키: ${key}`
      //   : `토큰이 성공적으로 받아졌습니다!\n\n토큰: ${verifiedToken.substring(0, 50)}...`;

      // 간단한 팝업 메시지
      // Alert.alert(
      //   '인증 완료',
      //   '인증 token이 발급 되었습니다.',
      //   [{ text: '확인', style: 'default' }]
      // );
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
        {/* <ThemedText style={styles.placeholderText}>
          딥링크 토큰 수신 테스트 앱
        </ThemedText> */}
        <ThemedText 
          style={styles.placeholderText}
          {...(Platform.OS === 'android' && { includeFontPadding: false })}
        >
          Tomo IDV
        </ThemedText>
        
        {/* 하드코딩된 사용자 정보 표시 */}
        {/* <ThemedView style={styles.userInfoContainer}>
          <ThemedText style={styles.userInfoTitle}>👤 등록된 사용자 정보</ThemedText>
          <ThemedView style={styles.userInfoRow}>
            <ThemedText style={styles.userInfoLabel}>사용자 ID:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{userIdInput || USER_CONFIG.userId}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.userInfoRow}>
            <ThemedText style={styles.userInfoLabel}>사용자명:</ThemedText>
            <ThemedText style={styles.userInfoValue}>{USER_CONFIG.userName}</ThemedText>
          </ThemedView>
        </ThemedView> */}
        
        {/* 토큰 수신 상태 표시 */}
        {/* <ThemedView style={[styles.statusContainer, receivedToken ? styles.statusSuccess : styles.statusWaiting]}>
          <ThemedText style={styles.statusTitle}>
            {receivedToken ? '✅ 토큰 수신 완료' : '⏳ 토큰 대기 중'}
          </ThemedText>
          <ThemedText style={styles.statusDescription}>
            {receivedToken 
              ? '토큰이 성공적으로 받아졌습니다!' 
              : '외부에서 딥링크로 토큰을 전달해주세요.'
            }
          </ThemedText>
        </ThemedView> */}

        {/* User ID 입력 필드 */}
        <ThemedView style={styles.userIdInputContainer}>
          <ThemedText 
            style={styles.userIdInputLabel}
            {...(Platform.OS === 'android' && { includeFontPadding: false })}
          >
            📧 Email
          </ThemedText>
          <TextInput
            style={styles.userIdInput}
            value={userIdInput}
            onChangeText={(text) => {
              setUserIdInput(text);
              // 입력 시마다 USER_CONFIG 업데이트
              if (text.trim() !== '') {
                updateUserId(text.trim());
                // 기존 디버그 로그 주석처리
                // addDebugLog('👤 User ID 변경: ' + text.trim());
              }
            }}
            placeholder="Enter email"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {/* <ThemedText style={styles.userIdInputHint}>
            현재 설정된 User ID가 화면과 검증 로직에 적용됩니다
          </ThemedText> */}
        </ThemedView>

        {/* 동적 버튼: 토큰이 있으면 리셋 버튼, 없으면 토큰 요청 버튼 */}
        {/* <TouchableOpacity
          style={[styles.requestButton, isLoading && styles.requestButtonDisabled]}
          onPress={handleRequestToken}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <ThemedText style={styles.requestButtonText}>🔄 요청 중...</ThemedText>
            </>
          ) : (
            <ThemedText style={styles.requestButtonText}>인증 시작</ThemedText>
          )}
        </TouchableOpacity> */}

        {/* 체험하기 버튼 (버튼 색깔을 연회색으로 변경) */}
        <TouchableOpacity
          style={[
            styles.requestButton,
            {
              // backgroundColor: '#198F3B', // 조금 더 어둡고 흰색이 잘 보이는 그린(Dark Green)
              backgroundColor: '#800000', // 조금 더 어둡고 흰색이 잘 보이는 그린(Dark Green)
            },
            isLoadingUS && styles.requestButtonDisabled,
          ]}
          onPress={handleRequestUSToken}
          disabled={isLoadingUS}
        >
          {isLoadingUS ? (
            <>
              <ActivityIndicator size="large" color="#fff" style={{ marginRight: 16 }} />
              <ThemedText 
                style={styles.requestButtonText}
                {...(Platform.OS === 'android' && { includeFontPadding: false })}
              >
                🔄 요청 중...
              </ThemedText>
            </>
          ) : (
            <ThemedText 
              style={styles.requestButtonText}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            >
              체험하기
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* 일본 인증 버튼 */}
        <TouchableOpacity
          style={[styles.requestButton, styles.jpButton, isLoadingJP && styles.requestButtonDisabled]}
          onPress={handleRequestJPToken}
          disabled={isLoadingJP}
        >
          {isLoadingJP ? (
            <>
              <ActivityIndicator size="large" color="#fff" style={{ marginRight: 16 }} />
              <ThemedText 
                style={styles.requestButtonText}
                {...(Platform.OS === 'android' && { includeFontPadding: false })}
              >
                🔄 要求中...
              </ThemedText>
            </>
          ) : (
            <ThemedText 
              style={styles.requestButtonText}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            >
              eKYCを体験する
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* 미국 인증 버튼 prod */}
        <TouchableOpacity
          style={[
            styles.requestButton,
            styles.usProductButton,
            isLoadingUSProduct && styles.requestButtonDisabled,
          ]}
          onPress={handleRequestUSProductToken}
          disabled={isLoadingUSProduct}
        >
          {isLoadingUSProduct ? (
            <>
              <ActivityIndicator size="large" color="#fff" style={{ marginRight: 16 }} />
              <ThemedText 
                style={styles.requestButtonText}
                {...(Platform.OS === 'android' && { includeFontPadding: false })}
              >
                🔄 REQUESTING...
              </ThemedText>
            </>
          ) : (
            <ThemedText 
              style={styles.requestButtonText}
              {...(Platform.OS === 'android' && { includeFontPadding: false })}
            >
              TRY US IDV
            </ThemedText>
          )}
        </TouchableOpacity>


        {/* 토큰 표시 - 주석처리 */}
        {/* {receivedToken && (
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
        )} */}

        {/* 토큰 검증 컴포넌트 - 주석처리 */}
        {/* {receivedToken && (
          <ThemedView style={styles.verifierContainer}>
            <ThemedText style={styles.verifierTitle}>🔐 토큰 검증 (간소화 버전)</ThemedText>
            <SimpleTokenVerifier
              token={receivedToken}
              publicKey={receivedKey || 'default-key'} // 토큰과 키는 한 쌍이므로 필수
              onVerificationComplete={(result) => {
                addDebugLog('🔍 검증 결과: ' + (result.isValid ? '성공' : '실패'));
                if (!result.isValid) {
                  addDebugLog('❌ 오류: ' + result.error);
                }
              }}
            />
          </ThemedView>
        )} */}

        {/* 디버그 로그 표시 - 주석처리 */}
        {/* {debugLogs.length > 0 && (
          <ThemedView style={styles.debugContainer}>
            <ThemedText style={styles.debugTitle}>📋 디버그 로그</ThemedText>
            {debugLogs.map((log, index) => (
              <ThemedText key={index} style={styles.debugLog}>
                {log}
              </ThemedText>
            ))}
          </ThemedView>
        )} */}

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f5f7fa',
    minHeight: '100%',
  },
  placeholderText: {
    fontSize: 36,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 48,
    fontWeight: '700',
    marginBottom: 48,
    paddingTop: Platform.OS === 'android' ? 4 : 0,
    letterSpacing: -0.5,
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
         debugContainer: {
           marginTop: 20,
           padding: 16,
           backgroundColor: '#f8f9fa',
           borderRadius: 8,
           borderWidth: 1,
           borderColor: '#dee2e6',
           width: '100%',
         },
         debugTitle: {
           fontSize: 14,
           color: '#495057',
           fontWeight: 'bold',
           marginBottom: 8,
           textAlign: 'center',
         },
         debugLog: {
           fontSize: 10,
           color: '#6c757d',
           fontFamily: 'monospace',
           marginVertical: 2,
           lineHeight: 14,
         },
         requestButton: {
           marginTop: 20,
           backgroundColor: '#007AFF',
           paddingTop: Platform.OS === 'android' ? 28 : 24,
           paddingBottom: Platform.OS === 'android' ? 28 : 24,
           paddingHorizontal: 32,
           borderRadius: 20,
           alignItems: 'center',
           justifyContent: 'center',
           width: '100%',
           minHeight: 100,
           shadowColor: '#000',
           shadowOffset: {
             width: 0,
             height: 4,
           },
           shadowOpacity: 0.15,
           shadowRadius: 8,
           elevation: 6,
         },
         requestButtonDisabled: {
           opacity: 0.6,
         },
         requestButtonText: {
           color: '#fff',
           fontSize: 30,
           fontWeight: '700',
           textAlign: 'center',
           lineHeight: 44,
           paddingTop: Platform.OS === 'android' ? 4 : 0,
           letterSpacing: 0.5,
         },
         usButton: {
           backgroundColor: '#25C375', // 채도를 높인 선명한 초록색(green)
           marginTop: 24,
         },
         usProductButton: {
           backgroundColor: '#B7CFE7', // 채도를 20% 더 낮춘 아주 연한 파랑색
           marginTop: 20,
         },
         jpButton: {
           backgroundColor: '#E9C0C9', // 채도를 20% 더 낮춘 아주 연한 분홍색
           marginTop: 20,
         },
         userIdInputContainer: {
           marginTop: 32,
           width: '100%',
         },
         userIdInputLabel: {
           fontSize: 28,
           color: '#1a1a1a',
           fontWeight: '700',
           marginBottom: 16,
           lineHeight: 38,
           paddingTop: Platform.OS === 'android' ? 4 : 0,
           letterSpacing: -0.3,
         },
         userIdInput: {
           backgroundColor: '#fff',
           borderWidth: 2,
           borderColor: '#e1e8ed',
           borderRadius: 16,
           paddingHorizontal: 20,
           paddingTop: Platform.OS === 'android' ? 20 : 18,
           paddingBottom: Platform.OS === 'android' ? 20 : 18,
           fontSize: 24,
           color: '#1a1a1a',
           width: '100%',
           minHeight: 64,
           lineHeight: 32,
           shadowColor: '#000',
           shadowOffset: {
             width: 0,
             height: 2,
           },
           shadowOpacity: 0.05,
           shadowRadius: 4,
           elevation: 2,
           ...(Platform.OS === 'android' && { 
             textAlignVertical: 'center',
             includeFontPadding: false,
           }),
         },
         userIdInputHint: {
           fontSize: 11,
           color: '#666',
           marginTop: 6,
           fontStyle: 'italic',
         },
       });
