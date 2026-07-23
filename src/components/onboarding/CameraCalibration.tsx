// src/components/onboarding/CameraCalibration.tsx
//
// 0단계 파이프라인: 전면 카메라로 60초 촬영 (0~30초 자연 상태, 30~60초 지시 수행).
// 이 컴포넌트는 카메라를 켜고 타이머/지시 문구를 관리하는 "화면 셸"만 담당한다.
// 실제 GV/FD/BR 계산은 AI-1이 구현한 baselineProcessor(src/lib/baselineProcessor.ts)가 담당.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBaselineProcessor } from "@/lib/baselineProcessor";
import type { BaselineProcessor, BaselineResult } from "@/types/onboarding";

const TOTAL_SECONDS = 60;
const BASELINE_SECONDS = 30;
const FRAME_INTERVAL_MS = 100; // 초당 10프레임을 AI-1 처리 함수로 전달

type Status = "intro" | "requesting" | "recording" | "processing" | "error";

export default function CameraCalibration({
  onComplete,
}: {
  onComplete: (result: BaselineResult) => void;
}) {
  const [status, setStatus] = useState<Status>("intro");
  const [elapsed, setElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<BaselineProcessor | null>(null);
  const elapsedRef = useRef(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (frameIdRef.current) clearInterval(frameIdRef.current);
    timerIdRef.current = null;
    frameIdRef.current = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const finishCalibration = useCallback(async () => {
    stopStream();
    setStatus("processing");
    const result = await processorRef.current?.onComplete();
    onComplete(
      result ?? { baselineGV: 0, baselineFD: 0, baselineBR: 0, plr: 0 }
    );
  }, [onComplete, stopStream]);

  const startCalibration = useCallback(() => {
    processorRef.current = createBaselineProcessor();
    elapsedRef.current = 0;
    setElapsed(0);

    timerIdRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= TOTAL_SECONDS) {
        finishCalibration();
      }
    }, 1000);

    frameIdRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      processorRef.current?.onFrame({
        canvas,
        elapsedSeconds: elapsedRef.current,
        phase: elapsedRef.current < BASELINE_SECONDS ? "baseline" : "instruction",
      });
    }, FRAME_INTERVAL_MS);
  }, [finishCalibration]);

  const requestCamera = useCallback(async () => {
    setStatus("requesting");
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("이 브라우저는 카메라 기능을 지원하지 않아요.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("recording");
      startCalibration();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "카메라 권한이 거부됐어요. 브라우저 설정에서 카메라 권한을 허용해주세요."
          : "카메라를 켜는 중 문제가 발생했어요. 다시 시도해주세요."
      );
    }
  }, [startCalibration]);

  const phase = elapsed < BASELINE_SECONDS ? "baseline" : "instruction";
  const remaining = TOTAL_SECONDS - elapsed;

  return (
    <div className="w-full max-w-sm space-y-6">
      {status === "intro" && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">카메라로 60초 촬영할게요</h1>
            <p className="mt-1 text-sm text-gray-500">
              처음 30초는 아이가 편하게 있으면 되고, 이후 30초는 화면에 뜨는
              동작을 따라하면 돼요.
            </p>
          </div>
          <button
            onClick={requestCamera}
            className="w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800"
          >
            카메라 켜기
          </button>
        </div>
      )}

      {status === "requesting" && (
        <p className="text-sm text-gray-500">카메라 권한을 요청하고 있어요…</p>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <p className="text-sm text-red-500">{errorMessage}</p>
          <button
            onClick={requestCamera}
            className="w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800"
          >
            다시 시도
          </button>
        </div>
      )}

      {status === "processing" && (
        <p className="text-sm text-gray-500">촬영 결과를 처리하고 있어요…</p>
      )}

      {/* 촬영 화면은 recording 상태일 때만 보이되, video 엘리먼트 자체는
          getUserMedia 이후 즉시 attach 되어야 하므로 항상 렌더링해둔다 */}
      <div className={status === "recording" ? "space-y-4" : "hidden"}>
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full -scale-x-100 transform"
          />
          <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            {String(Math.floor(remaining / 60)).padStart(2, "0")}:
            {String(remaining % 60).padStart(2, "0")}
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${(elapsed / TOTAL_SECONDS) * 100}%` }}
          />
        </div>

        <p className="text-center text-lg font-medium">
          {phase === "baseline" ? "편하게 있어보세요 😌" : "손 흔들어봐! 👋"}
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
