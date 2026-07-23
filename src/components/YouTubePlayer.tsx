// src/components/YouTubePlayer.tsx
'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

// YouTube IFrame API 스크립트는 페이지에 한 번만 로드되어야 하고,
// window.onYouTubeIframeAPIReady는 전역 콜백 1개뿐이라 여러 플레이어가
// 각자 덮어쓰면 마지막 컴포넌트만 초기화된다. 로더를 모듈 스코프에서
// 한 번만 만들고, 모든 플레이어가 같은 Promise를 기다리게 해서 해결한다.
let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve();

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  });

  return youtubeApiPromise;
}

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const elementId = `yt-player-${videoId}`;

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        events: {
          onReady: () => console.log('ready', videoId),
          onStateChange: (e) => console.log('state', videoId, e.data),
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId, elementId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        console.log(playerRef.current.getCurrentTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div id={elementId} />
      <div style={{ marginTop: 10 }}>
        <button onClick={() => playerRef.current?.playVideo()}>재생</button>
        <button onClick={() => playerRef.current?.pauseVideo()}>일시정지</button>
        <button onClick={() => playerRef.current?.seekTo(30, true)}>30초로 이동</button>
        <button onClick={() => console.log('현재 시간:', playerRef.current?.getCurrentTime())}>
          현재 시간 찍기
        </button>
      </div>
    </div>
  );
}