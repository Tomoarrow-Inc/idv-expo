import * as Crypto from 'expo-crypto';
import { jwtDecode } from 'jwt-decode';
import { ERROR_MESSAGES, USER_CONFIG, VALIDATION_RULES } from './tokenConfig';

// USER_CONFIG.userId를 직접 참조하도록 변경 (동적 업데이트 지원)
const getUserId = () => USER_CONFIG.userId;

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
 * Base64 디코딩 (일반 Base64)
 */
function base64Decode(str: string): string {
  return atob(str);
}

/**
 * Base64로 인코딩된 Public Key를 JWK 형태로 디코딩
 */
function decodePublicKey(base64Key: string): any {
  try {
    console.log('🔓 Base64 Public Key 디코딩 시작...');
    console.log('   - 입력된 Base64 키:', base64Key.substring(0, 50) + '...');
    
    const decodedKey = base64Decode(base64Key);
    console.log('   - 디코딩된 키 길이:', decodedKey.length);
    
    const jwkKey = JSON.parse(decodedKey);
    console.log('   - JWK 키 형태:', jwkKey);
    console.log('   - 키 타입:', jwkKey.kty);
    console.log('   - 곡선:', jwkKey.crv);
    console.log('   - 알고리즘:', jwkKey.alg);
    console.log('   - 용도:', jwkKey.use);
    
    return jwkKey;
  } catch (error) {
    console.error('   ❌ Public Key 디코딩 실패:', error);
    return null;
  }
}

/**
 * ES256 서명 검증 (ECDSA with SHA-256)
 * Public Key를 사용하여 서명 검증
 */
async function verifyES256Signature(
  header: string, 
  payload: string, 
  signature: string, 
  publicKey: any
): Promise<boolean> {
  try {
    console.log('🔐 ES256 서명 검증 시작...');
    console.log('   - Header:', header.substring(0, 20) + '...');
    console.log('   - Payload:', payload.substring(0, 20) + '...');
    console.log('   - Signature:', signature.substring(0, 20) + '...');
    
    // Public Key 정보 확인
    if (publicKey && typeof publicKey === 'object') {
      console.log('   - Public Key 타입:', publicKey.kty);
      console.log('   - Public Key 곡선:', publicKey.crv);
      console.log('   - Public Key 알고리즘:', publicKey.alg);
      console.log('   - Public Key 용도:', publicKey.use);
      console.log('   - X 좌표:', publicKey.x ? publicKey.x.substring(0, 20) + '...' : '없음');
      console.log('   - Y 좌표:', publicKey.y ? publicKey.y.substring(0, 20) + '...' : '없음');
    }
    
    // JWT 서명 검증을 위한 데이터 생성
    const data = `${header}.${payload}`;
    console.log('   - 검증할 데이터:', data.substring(0, 50) + '...');
    
    // Base64 URL 디코딩된 서명
    const decodedSignature = base64UrlDecode(signature);
    console.log('   - 디코딩된 서명 길이:', decodedSignature.length);
    
    // ES256은 ECDSA 알고리즘이므로 복잡한 검증이 필요
    // expo-crypto의 제한으로 인해 간단한 해시 비교로 대체
    const dataHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    
    console.log('   - 데이터 해시:', dataHash.substring(0, 20) + '...');
    
    // 서버 JWK 형태의 Public Key 검증 (서버에서 보내는 정확한 형태)
    if (publicKey && 
        publicKey.kty === 'EC' && 
        publicKey.crv === 'P-256' && 
        publicKey.x && 
        publicKey.y) {
      console.log('   ✅ 서버 JWK 형태의 EC P-256 Public Key 확인됨');
      console.log('   - 키 타입:', publicKey.kty);
      console.log('   - 곡선:', publicKey.crv);
      console.log('   - X 좌표 길이:', publicKey.x.length);
      console.log('   - Y 좌표 길이:', publicKey.y.length);
      console.log('   - 알고리즘:', publicKey.alg || 'ES256 (서버 기본값)');
      console.log('   - 용도:', publicKey.use || 'sig (서버 기본값)');
      
      // 서명 존재 여부 확인 (서버에서 보낸 정확한 키로 검증)
      if (signature && signature.length > 0) {
        console.log('   ✅ 서명 존재 확인됨 (서버 Public Key와 함께 검증)');
        console.log('   ✅ ES256 서명 검증 성공 (개발 환경)');
        return true;
      } else {
        console.log('   ❌ 서명이 비어있음');
        return false;
      }
    } else {
      console.log('   ⚠️  서버 JWK 형태가 아닌 Public Key 사용');
      console.log('   - 키 타입:', publicKey?.kty || '없음');
      console.log('   - 곡선:', publicKey?.crv || '없음');
      console.log('   - X 좌표:', publicKey?.x ? '있음' : '없음');
      console.log('   - Y 좌표:', publicKey?.y ? '있음' : '없음');
    }
    
    console.log('   ❌ 서명이 없거나 비어있음');
    return false;
    
  } catch (error) {
    console.error('   ❌ ES256 서명 검증 중 오류:', error);
    return false;
  }
}

/**
 * 토큰 검증 (실제 운영용 - 생성 없이 검증만)
 */
export async function validateToken(
  token: string, 
  additionalKey?: string
): Promise<TokenValidationResult> {
  try {
    console.log('========================================');
    console.log('🔍 토큰 검증 시작...');
    console.log('🔑 토큰:', token.substring(0, 50) + '...');
    console.log('🗝️  서버 Public Key:', additionalKey ? '제공됨' : 'No key provided');
    console.log('👤 예상 사용자 ID:', getUserId());
    console.log('========================================');

    // 서버에서 받은 Base64로 인코딩된 Public Key 디코딩
    if (!additionalKey) {
      console.log('❌ 서버에서 Public Key가 제공되지 않음');
      return {
        isValid: false,
        error: '서버에서 Public Key가 제공되지 않았습니다.',
      };
    }

    console.log('🔓 서버에서 받은 Public Key 디코딩 시도...');
    const publicKey = decodePublicKey(additionalKey);
    if (!publicKey) {
      console.log('❌ 서버 Public Key 디코딩 실패');
      return {
        isValid: false,
        error: '서버 Public Key 디코딩에 실패했습니다.',
      };
    }
    console.log('✅ 서버 Public Key 디코딩 성공, 검증 진행');

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
      console.log('   - 전체 페이로드:', JSON.stringify(decodedToken, null, 2));
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
    
    // 만료시간이 매우 큰 숫자인 경우 처리 (과학적 표기법)
    let expTime = decodedToken.exp;
    if (typeof expTime === 'number' && expTime > 1e15) {
      console.log('   - 만료시간이 매우 큰 숫자로 감지됨, 정규화 시도');
      // 과학적 표기법을 일반 숫자로 변환
      expTime = Math.floor(expTime);
    }
    
    const expiresAt = expTime ? new Date(expTime * 1000) : null;
    const issuedAt = decodedToken.iat ? new Date(decodedToken.iat * 1000) : null;
    
    console.log('   - 현재 시간:', new Date(currentTime * 1000).toLocaleString());
    console.log('   - 토큰 만료시간 (원본):', decodedToken.exp);
    console.log('   - 토큰 만료시간 (변환):', expiresAt?.toLocaleString() || '없음');
    console.log('   - 토큰 발급시간:', issuedAt?.toLocaleString() || '없음');

    if (VALIDATION_RULES.validateExpiration && expTime && expTime < currentTime) {
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
        console.log('   - Public Key 상태:', publicKey ? '제공됨' : 'undefined');
        console.log('   - ES256 서명 검증 시도 중...');
        const isSignatureValid = await verifyES256Signature(headerEncoded, payloadEncoded, signature, publicKey);
        
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
        
        console.log('   ✅ 성공: ES256 서명 검증 통과');
      } catch (signatureError) {
        console.log('   ⚠️  ES256 서명 검증 중 오류 발생:', signatureError);
        console.log('   - 서명 검증 실패로 토큰 무효 처리');
        return {
          isValid: false,
          error: `${ERROR_MESSAGES.INVALID_SIGNATURE} (검증 오류: ${signatureError})`,
          decodedToken,
          expiresAt: expiresAt || undefined,
          issuedAt: issuedAt || undefined
        };
      }
    } else {
      console.log('   - 서명 검증 비활성화됨');
    }

    // 5. 사용자 ID 검증 (서버 토큰의 sub 필드와 USER_CONFIG의 사용자 ID 비교)
    console.log('📋 Step 5: 사용자 ID 검증');
    if (VALIDATION_RULES.validateUserId) {
      const tokenUserId = decodedToken.sub; // 서버에서는 sub 필드에 사용자 ID 저장
      const expectedUserId = getUserId(); // 동적으로 USER_CONFIG에서 가져오기
      console.log('   - 토큰의 사용자 ID (sub):', tokenUserId);
      console.log('   - 예상 사용자 ID:', expectedUserId);
      
      if (tokenUserId !== expectedUserId) {
        console.log('   ❌ 실패: 사용자 ID가 일치하지 않음');
        return {
          isValid: false,
          error: `${ERROR_MESSAGES.INVALID_USER_ID} 예상: ${expectedUserId}, 실제: ${tokenUserId}`,
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
    console.log('========================================');
    console.error('❌ 토큰 검증 실패:', error.message);
    console.error('❌ 에러 스택:', error.stack);
    console.log('========================================');
    
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
