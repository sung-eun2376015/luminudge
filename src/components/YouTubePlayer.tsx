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
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const elementId = `yt-player-${videoId}`;

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        events: {
          onReady: () => console.log('ready', videoId),
          onStateChange: (e) => console.log('state', videoId, e.data),
        },
      });
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