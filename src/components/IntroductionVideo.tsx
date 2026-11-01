import { Link } from "react-router-dom";
import video from "../data/introduction-video.json";

type TranscriptScene = { id: string; title: string; text: string };

export default function IntroductionVideo() {
  if (!video.ready) return null;
  return (
    <section className="introduction-video" aria-labelledby="introduction-video-title">
      <h2 id="introduction-video-title">Welcome to The Divvy</h2>
      <p>A short introduction from Mat, and a look around the reviews.</p>
      <video controls playsInline preload="none" poster={video.poster} width={1920} height={1080} aria-label="Mat introduces The Divvy">
        <source src={video.src} type="video/mp4" />
        <track kind="captions" src={video.captions} srcLang="en" label="English" default />
        Your browser cannot play this video. <a href={video.src}>Download the introduction</a> or read the transcript below.
      </video>
      <details>
        <summary>Read the video transcript</summary>
        {(video.transcript as TranscriptScene[]).map(scene => (
          <div key={scene.id}><h3>{scene.title}</h3><p>{scene.text}</p></div>
        ))}
      </details>
      <p><Link to="/series/1">Start with Series One</Link>{" · "}<Link to="/archive">Browse every published review</Link></p>
    </section>
  );
}
