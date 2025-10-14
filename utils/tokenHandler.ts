import { router } from 'expo-router';
import { validateToken } from './tokenValidator';

/**
 * 토큰과 키 파라미터 처리 인터페이스
 */
export interface TokenParams {
  token: string | null;
  key: string | null;
}

/**
 * 파라미터 정규화 함수 (배열이면 첫 번째 요소 반환)
 */
export function normalizeParam(param: string | string[] | undefined | null): string | null {
  if (!param) return null;
  return Array.isArray(param) ? param[0] : param;
}

/**
 * 토큰과 키 파라미터 추출 및 정규화
 * verified_token, token 필드 모두 지원
 */
export function extractTokenParams(params: {
  verified_token?: string | string[];
  token?: string | string[];
  key?: string | string[];
}): TokenParams {
  // verified_token 또는 token 필드에서 토큰 추출
  const token = normalizeParam(params.verified_token || params.token);
  const key = normalizeParam(params.key);
  
  return { token, key };
}

/**
 * 토큰 검증 및 홈 화면으로 리다이렉션
 * @param token - 검증할 토큰
 * @param key - Public Key (Base64 인코딩)
 * @param delay - 리다이렉션 전 딜레이 (ms)
 */
export async function processTokenAndRedirect(
  token: string | null,
  key: string | null,
  delay: number = 100
): Promise<void> {
  if (token && key) {
    console.log('✅ 토큰과 키 수신 성공');
    console.log('   - Token:', token.substring(0, 50) + '...');
    console.log('   - Key:', key.substring(0, 50) + '...');
    
    // 토큰 검증 (옵션)
    try {
      console.log('🔍 토큰 검증 시작...');
      const validationResult = await validateToken(token, key);
      
      if (validationResult.isValid) {
        console.log('✅ 토큰 검증 성공');
      } else {
        console.log('⚠️  토큰 검증 실패:', validationResult.error);
        // 검증 실패해도 홈으로 리다이렉션 (검증은 컴포넌트에서도 수행)
      }
    } catch (error) {
      console.log('⚠️  토큰 검증 중 오류:', error);
    }
    
    console.log('🏠 홈 화면으로 리다이렉션 중...');
    
    // 약간의 딜레이를 주어 로그를 확인할 수 있게 함
    setTimeout(() => {
      router.replace({
        pathname: '/(tabs)',
        params: { 
          verified_token: token,
          key: key
        }
      });
    }, delay);
  } else {
    console.log('❌ 토큰 또는 키가 없습니다');
    console.log('   - Token:', token || 'missing');
    console.log('   - Key:', key || 'missing');
    console.log('🏠 홈 화면으로 리다이렉션 중...');
    
    setTimeout(() => {
      router.replace('/(tabs)');
    }, delay);
  }
}

/**
 * 디버그 로그 출력 함수
 */
export function logTokenParams(
  source: string,
  params: any,
  tokenParams: TokenParams
): void {
  console.log(`📍 ${source} 마운트됨`);
  console.log('📦 전체 Params:', params);
  console.log('🔑 Token:', tokenParams.token);
  console.log('🗝️  Key:', tokenParams.key);
}

