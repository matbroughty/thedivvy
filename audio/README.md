# Review narration

Tagged ElevenLabs narration scripts live in `scripts/`. Published MP3s are
stored in S3 rather than committed to Git.

## Existing media hosting

- Bucket: `broughtydata`, region `eu-west-2`.
- Distribution: `EFO1YLQE2R2A9`, `https://d39p7vg8kswmae.cloudfront.net`.
- This distribution's active origin has the path `/fourfold`. Consequently,
  S3 key `fourfold/thedivvy/audio/example-v1.mp3` is served at public path
  `/thedivvy/audio/example-v1.mp3`.
- The existing bucket policy permits CloudFront reads. No public bucket access
  or infrastructure changes were needed for the pilot.
- Use versioned filenames: objects have an immutable, one-year cache lifetime.
  Upload a new version and update frontmatter when replacing a recording.

The first recording is
`fourfold/thedivvy/audio/series-2-episode-9-raise-the-hispanic-v1.mp3`.
It is Mat's original 128 kbps mono MP3, approximately 7.5 MB and 8:09 long.

## Adding audio to a review

Add an optional frontmatter block:

```yaml
audio:
  url: "https://d39p7vg8kswmae.cloudfront.net/thedivvy/audio/example-v1.mp3"
  durationSeconds: 489
  abridged: true
  aiNarrated: true
  narrationNote: "My voice, AI me — as if I'd gone to private school rather than a state school in Faversham"
```

`ReviewAudioPlayer` renders above the episode gallery only when this block is
present. The native browser player has no autoplay and uses `preload="none"`;
an always-visible MP3 link provides an alternative way to listen. Byte-range
requests through CloudFront allow seeking. Keep the abridgement and AI labels
accurate for each recording.

An optional `narrationNote` replaces the generic AI narration label with a
personal explanation, while the abridgement label remains visible.
