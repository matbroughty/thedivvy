# The Divvy video workshop

Separate Remotion + React/TypeScript workspace. Production remains React/Vite/MDX on static AWS Amplify hosting; its build does not install video dependencies. Requires Node 22.12+ and the root project's Puppeteer installation.

## Review the script and preview

Edit `narration.md` by scene ID. New wording is a draft for Mat's approval, based on his About page. `scenes.json` holds capture routes, phrase cues, named target regions and the configured narration voice ID.

From the repository root, start `npm run dev`. In another terminal:

```sh
cd video
npm ci
npm run capture
npm run timeline
npm run studio
```

Open the Studio URL printed in the terminal. `npm run render:preview` exports `output/introduction-preview.mp4`: 1920×1080 H.264, silent, clearly marked as a draft. Draft timing estimates 145 words per minute. Only final rendering uses actual narration timings.

## After Mat approves the words

Run from `video/`, only after approval in chat:

```sh
npm run approve -- --confirm
npm run render
npm run publish
```

Approval records the exact narration revision locally; wording changes invalidate it. Credentials and approval files are ignored by Git. The current narration uses Mat’s supplied OldGeezer exports, with word timings measured locally. The script checks the voice's account name and refuses substitutions. For the connected-account workflow, use MCP speech generation with the configured voice ID (one take per scene), then MCP Scribe transcription to obtain word timing. Import the downloaded MP3 and a JSON object containing `voice_id`, the exact generation prompt as `text`, `words: [{text,start,end}]`, and optionally `duration` in seconds and `source` using `npm run import:narration -- SCENE AUDIO.mp3 TIMING.json`. This validates the approved words, actual voice ID and phrase cues before caching. Imported scenes need no local API key. Speech and transcription consume credits; both wait for approval.

For models supported by the official timestamp endpoint, set `ELEVENLABS_API_KEY` and run `npm run narrate` before rendering if you need new audio. The generator obtains audio and character alignment in one request:
https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps/

Per-scene audio and derived word timing are cached in `public/audio/` and can be committed with the video sources, so another checkout can reuse the same narration without spending credits. Raw API responses remain ignored. Hashes include text, voice ID, model, settings and output format. Changing camera regions does not regenerate audio. API calls are not automatically retried. Raw paid responses are saved before timing validation for recovery. After a timeout, check ElevenLabs history before retrying to avoid duplicate charges.

Final files: `output/introduction.mp4`, `output/poster.jpg`, `output/captions.vtt`, `output/transcript.json`. The publish command copies assets into the site's `public/videos/introduction/`, sets `src/data/introduction-video.json`, and enables the About-page player. It performs no deployment or commit. Until then the About page shows its existing content without a draft or broken player.

The player uses native controls, `preload="none"`, inline mobile playback, a poster, English WebVTT captions and an expandable transcript; no autoplay. Preview `/about` locally after publishing. Amplify serves the MP4 as a static file. Check its eventual size before deployment; a larger film can use an external media URL in the manifest.

## Phrase cues and regions

A cue in `scenes.json`:

```json
{"phrase":"select a series","region":"series","zoom":1.65,"duration":1.4,"highlight":true}
```

Optional `occurrence` selects a repeated phrase (1-based). Matching ignores case and punctuation, uses whole words, and fails if the phrase is missing. Final triggers come from aligned word timing, never guessed timestamps. Movements hold until the next cue or scene boundary. Scene fades, restrained zooms, brass outlines and animated opening/closing cards use the site's cream/mahogany palette. Titles use Georgia, its serif fallback; no external font or music asset is required.

Named regions accept a CSS selector or `[x,y,width,height]` in original 1920×1080 screenshot pixels. Capture measures selectors into `public/screenshots/*.regions.json`. Edit selectors/coordinates in `scenes.json` and recapture without touching the engine. Keep regions inside the viewport. Camera centres are clamped to prevent exposing screenshot edges. Recheck framing after changing zoom or region size.

Screenshots show the actual local site. Capture masks all raster images, CSS background images and embedded media, retaining layout, text and numerical ratings without including Lovejoy stills, portraits, footage or music. The production site's DOM/styles are unaffected. `public/screenshots/provenance.json` records capture date, origin and masking policy. For another port use `SITE_URL=http://localhost:5174 npm run capture`.

Burned-in subtitles default on for the silent draft and off for final output, so the site’s default WebVTT captions do not appear twice. Override via Studio props (`captions: true` or `false`). The WebVTT track remains separate for the site player.

## Checks

```sh
# video/
npm run check
# repository root
npm test
npm run build
```

Tests cover narration parsing, character-to-word alignment, phrase matching, repeated occurrences, missing phrases and cache invalidation. There is no configured linter. Chromium capture/render and local servers may need sandbox approval.
