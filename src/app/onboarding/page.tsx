// src/app/onboarding/page.tsx
// 0단계 파이프라인: 보호자 정보 입력 -> 카메라 60초 캘리브레이션 -> 완료
"use client";

import { useState } from "react";
import Link from "next/link";
import GuardianInfoForm from "@/components/onboarding/GuardianInfoForm";
import CameraCalibration from "@/components/onboarding/CameraCalibration";
import { saveOnboarding } from "@/lib/onboardingStorage";
import type {
  BaselineResult,
  GuardianInfo,
  OnboardingRecord,
} from "@/types/onboarding";

type Step = "info" | "calibration" | "done";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("info");
  const [guardianInfo, setGuardianInfo] = useState<GuardianInfo | null>(null);

  function handleInfoSubmit(info: GuardianInfo) {
    setGuardianInfo(info);
    setStep("calibration");
  }

  async function handleCalibrationComplete(baseline: BaselineResult) {
    if (!guardianInfo) return; // 방어적 처리: info 단계 없이는 도달 불가

    const record: OnboardingRecord = {
      ...guardianInfo,
      ...baseline,
      completedAt: new Date().toISOString(),
    };

    await saveOnboarding(record);
    setStep("done");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className={step === "info" ? "font-semibold text-black" : ""}>
          1. 아이 정보
        </span>
        <span>→</span>
        <span
          className={step === "calibration" ? "font-semibold text-black" : ""}
        >
          2. 카메라 캘리브레이션
        </span>
      </div>

      {step === "info" && <GuardianInfoForm onSubmit={handleInfoSubmit} />}

      {step === "calibration" && (
        <CameraCalibration onComplete={handleCalibrationComplete} />
      )}

      {step === "done" && (
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold">준비 완료! 🎉</h1>
          <p className="text-sm text-gray-500">
            아이 정보와 baseline 데이터가 저장됐어요.
          </p>
          <Link
            href="/"
            className="inline-block w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800"
          >
            홈으로
          </Link>
        </div>
      )}
    </main>
  );
}
