// src/lib/onboardingStorage.ts
//
// 저장 구조 결정: CLS와 동일하게 브라우저 내부에서 처리 후, 결과 요약만 서버에 전송한다.
// (WebSocket/polling 불필요 — 온보딩은 60초 동안 1회성으로 계산되는 데이터라 실시간 스트리밍 대상이 아님)
// 우선 localStorage에 저장해 새로고침에도 유지되게 하고, 백엔드 엔드포인트가 준비되면
// postOnboardingToBackend가 /onboarding 같은 라우트로 POST하도록 한다.

import type { OnboardingRecord } from "@/types/onboarding";

const STORAGE_KEY = "luminudge_onboarding";

export function saveOnboardingLocal(record: OnboardingRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn("[onboarding] localStorage 저장 실패:", err);
  }
}

export function loadOnboardingLocal(): OnboardingRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingRecord) : null;
  } catch (err) {
    console.warn("[onboarding] localStorage 읽기 실패:", err);
    return null;
  }
}

/**
 * 백엔드로 온보딩 요약을 전송한다.
 * 백엔드에 아직 /onboarding 라우트가 없다면 실패해도 온보딩 플로우 자체는 막지 않는다
 * (요청은 best-effort, 로컬 저장이 1차 진실 소스).
 */
export async function postOnboardingToBackend(
  record: OnboardingRecord
): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${apiUrl}/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch (err) {
    console.warn(
      "[onboarding] 백엔드 전송 실패 (로컬 저장은 유지됨):",
      err
    );
    return false;
  }
}

/** 온보딩 완료 시 호출하는 통합 저장 함수 */
export async function saveOnboarding(
  record: OnboardingRecord
): Promise<void> {
  saveOnboardingLocal(record);
  await postOnboardingToBackend(record);
}
