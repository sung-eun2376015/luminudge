// src/app/page.tsx
import Link from 'next/link';
import YouTubePlayer from '@/components/YouTubePlayer';

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <Link href="/onboarding" style={{ display: 'inline-block', marginBottom: 20 }}>
        온보딩 시작하기 →
      </Link>

      <h1>영상 1</h1>
      <YouTubePlayer videoId="hMk967lfd7I" />

      <h1 style={{ marginTop: 60 }}>영상 2</h1>
      <YouTubePlayer videoId="0RGt-CrFCO0" />
    </div>
  );
}