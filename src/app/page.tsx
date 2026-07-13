// src/app/page.tsx
import YouTubePlayer from '@/components/YouTubePlayer';

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>영상 1</h1>
      <YouTubePlayer videoId="hMk967lfd7I" />

      <h1 style={{ marginTop: 60 }}>영상 2</h1>
      <YouTubePlayer videoId="0RGt-CrFCO0" />
    </div>
  );
}