import type { ReviewAudio } from "../types";

export default function ReviewAudioPlayer({
  audio,
  title,
}: {
  audio: ReviewAudio;
  title: string;
}) {
  const minutes = Math.floor(audio.durationSeconds / 60);
  const seconds = Math.floor(audio.durationSeconds % 60);
  const notes = [
    audio.abridged && "Abridged review",
    audio.narrationNote || (audio.aiNarrated && "AI narration"),
  ].filter(Boolean);

  return (
    <section className="review-audio" aria-labelledby="review-audio-title">
      <div className="review-audio__heading">
        <h2 id="review-audio-title">Listen to this review</h2>
        <span>{minutes} min {seconds} sec</span>
      </div>
      {notes.length > 0 && (
        <p className="review-audio__note">{notes.join(" · ")}</p>
      )}
      <audio
        key={audio.url}
        controls
        preload="none"
        aria-label={`Listen to the ${title} review`}
      >
        <source src={audio.url} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
      <a className="review-audio__link" href={audio.url}>
        Open MP3
      </a>
    </section>
  );
}
