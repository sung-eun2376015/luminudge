// src/lib/baselineProcessor.ts
//
// [AI-1 통합 지점] 이 파일은 스텁입니다.
// CameraCalibration 컴포넌트가 60초 동안 매 프레임(canvas)을 onFrame으로 넘겨주고,
// 60초가 끝나면 onComplete를 호출해 최종 baseline 지표(GV/FD/BR/PLR)를 받습니다.
//
// AI-1은 이 파일의 createBaselineProcessor() 내부 구현을 MediaPipe 기반 로직으로
// 교체하면 됩니다. 프론트 쪽 코드(CameraCalibration.tsx)는 수정할 필요 없습니다.
// 인터페이스를 바꿔야 한다면 src/types/onboarding.ts의 BaselineProcessor를 함께 상의해서 수정해주세요.

import type {
  BaselineProcessor,
  BaselineResult,
  CalibrationFrame,
} from "@/types/onboarding";

/**
 * 임시 스텁 구현.
 * 실제 GV/FD/BR/PLR 계산 없이, 프레임 수만 세다가 완료 시 더미 값을 반환합니다.
 * 개발 중 온보딩 플로우 UI/저장 로직을 테스트하기 위한 용도입니다.
 */
function createStubBaselineProcessor(): BaselineProcessor {
  let baselineFrameCount = 0;
  let instructionFrameCount = 0;
  let firstInstructionFrameAt: number | null = null;

  return {
    onFrame(frame: CalibrationFrame) {
      if (frame.phase === "baseline") {
        baselineFrameCount += 1;
      } else {
        instructionFrameCount += 1;
        if (firstInstructionFrameAt === null) {
          firstInstructionFrameAt = frame.elapsedSeconds;
        }
      }
    },

    onComplete(): BaselineResult {
      // TODO(AI-1): 실제 MediaPipe 기반 계산으로 교체
      return {
        baselineGV: 0,
        baselineFD: 0,
        baselineBR: 0,
        plr: firstInstructionFrameAt ? firstInstructionFrameAt - 30 : 0,
      };
    },

    reset() {
      baselineFrameCount = 0;
      instructionFrameCount = 0;
      firstInstructionFrameAt = null;
    },
  };
}

/** CameraCalibration에서 사용하는 팩토리 함수 */
export function createBaselineProcessor(): BaselineProcessor {
  return createStubBaselineProcessor();
}
