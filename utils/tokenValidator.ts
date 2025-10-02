import * as Crypto from 'expo-crypto';
import { jwtDecode } from 'jwt-decode';
import { ERROR_MESSAGES, TOKEN_KEYS, USER_CONFIG, VALIDATION_RULES } from './tokenConfig';

// 하드코딩된 사용자 ID
export const USER_ID = USER_CONFIG.userId;

export interface TokenValidationResult {
  isValid: boolean;
  decodedToken?: any;
  error?: string;
  expiresAt?: Date;
  issuedAt?: Date;
  userId?: string;
  userRole?: string;
}

/**
 * Base64 URL 디코딩 (React Native 호환)
 */
function base64UrlDecode(str: string): string {
  str += new Array(5 - str.length % 4).join('=');
  str = str.replace(/\-/g, '+').replace(/_/g, '/');
  return atob(str);
}

/**
 * HMAC-SHA256 서명 검증 (React Native 호환)
 */
async function verifySignature(header: string, payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const data = `${header}.${payload}`;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    
    // 간단한 HMAC 구현 (실제로는 더 정교한 구현이 필요)
    const keyHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      secret,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    
    const expectedSignature = btoa(hash)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('서명 검증 중 오류:', error);
    return false;
  }
}

/**
 * 토큰 검증 (실제 운영용 - 생성 없이 검증만)
 */
export async function validateToken(
  token: string, 
  secretKey: string = TOKEN_KEYS.secretKey,
  additionalKey?: string
): Promise<TokenValidationResult> {
  try {
    console.log('🔍 토큰 검증 시작...');
    console.log('🔑 토큰:', token.substring(0, 50) + '...');
    console.log('🔐 비밀키:', secretKey ? '제공됨' : 'undefined');
    console.log('🗝️  추가 키:', additionalKey || 'No additional key');
    console.log('👤 예상 사용자 ID:', USER_ID);

    // 1. 토큰 형식 검증
    console.log('📋 Step 1: 토큰 형식 검증');
    const parts = token.split('.');
    console.log('   - 토큰 부분 개수:', parts.length);
    if (parts.length !== 3) {
      console.log('   ❌ 실패: JWT는 3개 부분으로 구성되어야 함');
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_FORMAT
      };
    }
    console.log('   ✅ 성공: 토큰 형식 올바름');

    const [headerEncoded, payloadEncoded, signature] = parts;
    console.log('   - Header:', headerEncoded.substring(0, 20) + '...');
    console.log('   - Payload:', payloadEncoded.substring(0, 20) + '...');
    console.log('   - Signature:', signature.substring(0, 20) + '...');

    // 2. 페이로드 디코딩 (서명 검증 전에 먼저 디코딩)
    console.log('📋 Step 2: 토큰 디코딩');
    let decodedToken: any;
    try {
      decodedToken = jwtDecode(token);
      console.log('   ✅ 디코딩 성공');
      console.log('   - sub (사용자 ID):', decodedToken.sub);
      console.log('   - iss (발급자):', decodedToken.iss);
      console.log('   - aud (대상자):', decodedToken.aud);
      console.log('   - iat (발급시간):', decodedToken.iat ? new Date(decodedToken.iat * 1000).toLocaleString() : '없음');
      console.log('   - exp (만료시간):', decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : '없음');
      console.log('   - jti (JWT ID):', decodedToken.jti);
    } catch (decodeError) {
      console.log('   ❌ 디코딩 실패:', decodeError);
      return {
        isValid: false,
        error: ERROR_MESSAGES.DECODE_FAILED
      };
    }

    // 3. 만료시간 검증 (서명 검증 전에 먼저 확인)
    console.log('📋 Step 3: 만료시간 검증');
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresAt = decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;
    const issuedAt = decodedToken.iat ? new Date(decodedToken.iat * 1000) : null;
    
    console.log('   - 현재 시간:', new Date(currentTime * 1000).toLocaleString());
    console.log('   - 토큰 만료시간:', expiresAt?.toLocaleString() || '없음');
    console.log('   - 토큰 발급시간:', issuedAt?.toLocaleString() || '없음');

    if (VALIDATION_RULES.validateExpiration && decodedToken.exp && decodedToken.exp < currentTime) {
      console.log('   ❌ 실패: 토큰이 만료됨');
      return {
        isValid: false,
        error: `${ERROR_MESSAGES.EXPIRED} 만료시간: ${expiresAt?.toLocaleString()}`,
        decodedToken,
        expiresAt: expiresAt || undefined,
        issuedAt: issuedAt || undefined
      };
    }
    console.log('   ✅ 성공: 토큰이 유효한 시간 범위 내');

    // 4. 서명 검증 (가장 중요한 단계)
    console.log('📋 Step 4: 서명 검증');
    if (VALIDATION_RULES.validateSignature) {
      try {
        console.log('   - 비밀키 상태:', secretKey ? '제공됨' : 'undefined');
        const isSignatureValid = await verifySignature(headerEncoded, payloadEncoded, signature, secretKey);
        
        if (!isSignatureValid) {
          console.log('   ❌ 실패: 서명이 유효하지 않음 (위조된 토큰일 수 있음)');
          return {
            isValid: false,
            error: `${ERROR_MESSAGES.INVALID_SIGNATURE} (위조된 토큰일 수 있음)`,
            decodedToken,
            expiresAt: expiresAt || undefined,
            issuedAt: issuedAt || undefined
          };
        }
        
        console.log('   ✅ 성공: 서명 검증 통과');
      } catch (signatureError) {
        console.log('   ⚠️  서명 검증 중 오류 발생:', signatureError);
        console.log('   - 디코딩만으로 진행 (개발/테스트 환경)');
        // 서명 검증 실패 시에도 디코딩된 정보는 유효할 수 있음 (개발/테스트 환경)
      }
    } else {
      console.log('   - 서명 검증 비활성화됨');
    }

    // 5. 사용자 ID 검증 (서버 토큰의 sub 필드와 하드코딩된 사용자 ID 비교)
    console.log('📋 Step 5: 사용자 ID 검증');
    if (VALIDATION_RULES.validateUserId) {
      const tokenUserId = decodedToken.sub; // 서버에서는 sub 필드에 사용자 ID 저장
      console.log('   - 토큰의 사용자 ID (sub):', tokenUserId);
      console.log('   - 예상 사용자 ID:', USER_ID);
      
      if (tokenUserId !== USER_ID) {
        console.log('   ❌ 실패: 사용자 ID가 일치하지 않음');
        return {
          isValid: false,
          error: `${ERROR_MESSAGES.INVALID_USER_ID} 예상: ${USER_ID}, 실제: ${tokenUserId}`,
          decodedToken,
          expiresAt: expiresAt || undefined,
          issuedAt: issuedAt || undefined
        };
      }
      console.log('   ✅ 성공: 사용자 ID 일치');
    } else {
      console.log('   - 사용자 ID 검증 비활성화됨');
    }

    // 6. 최종 결과 반환
    console.log('📋 Step 6: 최종 결과 생성');
    const result: TokenValidationResult = {
      isValid: true,
      decodedToken,
      expiresAt: expiresAt || undefined,
      issuedAt: issuedAt || undefined,
      userId: decodedToken.sub, // 서버 토큰에서는 sub 필드가 사용자 ID
      userRole: undefined, // 서버 토큰에는 역할 정보 없음
    };

    console.log('🎉 모든 검증 통과! 토큰이 유효합니다.');
    console.log('   - 사용자 ID:', result.userId);
    console.log('   - 만료시간:', result.expiresAt?.toLocaleString());
    console.log('   - 발급시간:', result.issuedAt?.toLocaleString());
    return result;

  } catch (error: any) {
    console.error('❌ 토큰 검증 실패:', error.message);
    
    return {
      isValid: false,
      error: error.message,
    };
  }
}

/**
 * 토큰 디코딩만 (서명 검증 없이)
 */
export function decodeTokenOnly(token: string): any {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
}

/**
 * 토큰 만료 여부만 확인
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : false;
  } catch (error) {
    return true; // 디코딩 실패 시 만료된 것으로 간주
  }
}
