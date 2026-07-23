// src/types/onboarding.ts
// 온보딩(0단계: Onboarding & Baseline Calibration) 관련 공유 타입.
// AI-1과의 통합 지점이므로, 이 파일의 타입을 바꿀 땐 AI-1과 먼저 상의할 것.

/** 보호자가 입력하는 아이 기본 정보 */
export interface GuardianInfo {
  /** 만 나이 (2~7세 범위로 입력받음) */
  ageYears: number;
  gender: "male" | "female";
}

/** 60초 캘리브레이션의 두 구간 */
export type CalibrationPhase = "baseline" | "instruction";

/**
 * Dev(프론트)가 매 프레임마다 AI-1의 처리 함수로 넘겨주는 데이터.
 * canvas에는 해당 시점의 카메라 프레임이 그려져 있음 (getImageData 등으로 픽셀 접근 가능).
 */
export interface CalibrationFrame {
  canvas: HTMLCanvasElement;
  /** 캘리브레이션 시작 후 경과 시간(초), 0~60 */
  elapsedSeconds: number;
  phase: CalibrationPhase;
}

/**
 * AI-1이 60초 영상 전체를 바탕으로 최종 산출하는 baseline 지표.
 * 파이프라인 문서 0단계 기준: Baseline GV / FD / BR + 지시 반응 속도(PLR 기준값)
 */
export interface BaselineResult {
  baselineGV: number; // Baseline Gaze Variance
  baselineFD: number; // Baseline Fixation Duration
  baselineBR: number; // Baseline Blink Rate
  plr: number; // 지시 반응 속도 (초 단위)
}

/**
 * AI-1이 구현할 인터페이스.
 * - onFrame: 매 프레임 호출 (실시간 누적 계산용)
 * - onComplete: 60초 종료 시 1회 호출, 최종 baseline 지표를 반환
 */
export interface BaselineProcessor {
  onFrame(frame: CalibrationFrame): void;
  onComplete(): BaselineResult | Promise<BaselineResult>;
  /** 캘리브레이션이 중간에 취소/재시작될 때 내부 상태 초기화용 (선택) */
  reset?(): void;
}

/** 온보딩 완료 후 로컬/서버에 저장되는 전체 레코드 */
export interface OnboardingRecord extends GuardianInfo, BaselineResult {
  completedAt: string; // ISO timestamp
}
