// 토큰 검증에 필요한 설정 정보들

// 하드코딩된 사용자 정보
export const USER_CONFIG = {
  userId: '7999752903327968493',
  userRole: 'user', // 또는 'admin', 'premium' 등
  userName: 'IDV User', // 사용자명 (선택사항)
};

// USER_CONFIG 업데이트 함수
export function updateUserId(newUserId: string): void {
  USER_CONFIG.userId = newUserId;
  console.log('✅ USER_CONFIG.userId 업데이트됨:', newUserId);
}

// 서버에서 Base64로 인코딩된 Public Key를 받아서 사용
// 하드코딩된 키는 제거됨 - 서버에서 동적으로 제공

// 토큰 검증 규칙 설정 (서버 토큰 형식에 맞춤)
export const VALIDATION_RULES = {
  validateUserId: true, // 사용자 ID 검증 여부 (sub 필드)
  validateExpiration: true, // 만료시간 검증 여부
  validateSignature: true, // ES256 서명 검증 활성화
};

// 에러 메시지들
export const ERROR_MESSAGES = {
  INVALID_FORMAT: '유효하지 않은 JWT 형식입니다.',
  DECODE_FAILED: '토큰을 디코딩할 수 없습니다.',
  EXPIRED: '토큰이 만료되었습니다.',
  INVALID_SIGNATURE: '토큰 서명이 유효하지 않습니다.',
  INVALID_USER_ID: '사용자 ID가 일치하지 않습니다.',
};

// 서버 토큰 정보 인터페이스 (실제 서버 형식에 맞춤)
export interface TokenInfo {
  sub: string; // 사용자 ID (서버에서 사용하는 필드명)
  iss: string; // 발급자
  aud: string; // 대상자
  iat: number; // 발급시간
  exp: number; // 만료시간
  jti: string; // JWT ID
}

// 검증 결과 인터페이스
export interface ValidationResult {
  isValid: boolean;
  tokenInfo?: TokenInfo;
  error?: string;
  expiresAt?: Date;
  issuedAt?: Date;
}
