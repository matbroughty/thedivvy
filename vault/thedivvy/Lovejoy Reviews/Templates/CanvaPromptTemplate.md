# Canva AI Prompt Template (5-slide Instagram carousel)

Use this as a starting point when asking Canva AI to update the existing
5-slide carousel template for a new episode. Replace the `{PLACEHOLDER}`
values, drop the result into the Canva AI chat, then add the screenshots
yourself once Canva finishes updating the text. The prompt tells Canva
explicitly not to generate, replace or move any images.

The template assumes Canva already has the previous episode's deck saved.
Adjust the opening line ("This is a copy of episode N template...") to
point at whichever episode is the starting point.

Two blocks below are **optional** — include them only when they apply:
the per-series recolour (first episode of a new series only) and the
extra slide (only when an episode has a digression worth its own panel).

---

## Per-series colour (first episode of a new series only)

Each series has its own accent on the site — `[data-series="N"]` in
`src/styles/global.css`. Carry the same palette into the carousel so the
Instagram run for a series matches its pages. Recolour once, on the first
episode of the series, then leave the deck alone for the rest of it.

| Series | Name       | Accent    | Deep accent | Background |
| ------ | ---------- | --------- | ----------- | ---------- |
| 1      | Mahogany   | `#8a4b2a` | `#6e3a1e`   | `#f6f0e3`  |
| 2      | Walnut     | `#6b4a2f` | `#4a331f`   | `#f4ecdb`  |
| 3      | Aged brass | `#9d7833` | `#7a5b22`   | `#f7f1da`  |
| 4      | Burgundy   | `#7a2f2c` | `#5a1e1c`   | `#f7ede3`  |
| 5      | Verdigris  | `#4a6a5a` | `#324a3f`   | `#eff1e3`  |
| 6      | Pewter     | `#5a5044` | `#3f3830`   | `#f1efe8`  |

Paste this into the prompt, with the hexes filled in:

> **New colour scheme.** This is the start of a new series, so the carousel needs a subtly different theme from the previous decks. Change the background on every slide to **{BACKGROUND}**. Change headings and accent elements to **{ACCENT}**, and use **{DEEP_ACCENT}** for emphasis text and the star rating. Body text stays near-black. Keep the fonts, layout, spacing and all image placeholder positions exactly as they are — this is a colour change only, so the deck still reads as part of the same family, just a new series.

Verdigris and pewter are the two that will look most unlike the others.
Check the star rating stays legible on those before posting.

---

## Optional extra slide

Five slides is the default. When an episode throws up a digression that
earns its own panel — a period detail, a piece of trivia, a bit of
production history — add a sixth. Put it **between the Divvy Observation
and the Verdict** so the verdict and quote still close the carousel.

> **Add one slide.** This episode needs six slides rather than five. Insert a new slide between the Divvy Observation and the Verdict, using the same layout as the Divvy Observation slide (text block plus one empty image placeholder).

Then give it a short all-caps label and two lines at most:

**Slide 4**

{SLIDE_LABEL_UPPERCASE}

{EXTRA_SLIDE_LINE_1}

{EXTRA_SLIDE_LINE_2}

Image slot (my reference — leave the slide's placeholder empty): {EXTRA_SLIDE_IMAGE_DESCRIPTION}

Used so far: S02E01 "PERIOD DETAIL: THE LAZER CRASH HELMET".

---

## Template (placeholders to replace)

This is a copy of episode {PREVIOUS_EPISODE_NUMBER} template that needs updating for episode {EPISODE_NUMBER}. **Update the text only. Do not generate, create, replace or move any images.** Any existing image placeholder on each slide should stay exactly where it is — I will add my own screenshots afterwards. The "Image slot" lines below are notes for me, not instructions for you. For {EPISODE_TITLE}, adapt the template like this:

<!-- If this is the first episode of a new series, insert the colour-scheme
     paragraph here, before the slides. If the episode needs a sixth slide,
     insert the "Add one slide" paragraph here too, then include Slide 4
     below and renumber Verdict and Quote to 5 and 6. -->


**Slide 1**

{EPISODE_TITLE_UPPERCASE}

Lovejoy Series {SERIES_NUMBER} Episode {EPISODE_NUMBER}

Image slot (my reference — leave the slide's placeholder empty): {SLIDE_1_IMAGE_DESCRIPTION}

**Slide 2**

PLOT IN ONE WINK

{ONE_WINK_PLOT_TEXT}

Image slot (my reference — leave the slide's placeholder empty): {SLIDE_2_IMAGE_DESCRIPTION}

**Slide 3**

DIVVY OBSERVATION

{DIVVY_OBSERVATION_LINE_1}

or

{DIVVY_OBSERVATION_LINE_2}

Image slot (my reference — leave the slide's placeholder empty): {SLIDE_3_IMAGE_DESCRIPTION}

**Slide 4**

VERDICT

{VERDICT_LINE_1}

{VERDICT_LINE_2}

{VERDICT_LINE_3}

{STAR_RATING}

Image slot (my reference — leave the slide's placeholder empty): {SLIDE_4_IMAGE_DESCRIPTION}

**Slide 5**

QUOTE + SCORE

"{HEADLINE_QUOTE}"

{STAR_RATING}

Then underneath:

Full review at TheDivvy.co.uk

---

## Worked example — S01E03 The Sting

This is a copy of episode two template that needs updating for episode 3. **Update the text only. Do not generate, create, replace or move any images.** Any existing image placeholder on each slide should stay exactly where it is — I will add my own screenshots afterwards. The "Image slot" lines below are notes for me, not instructions for you. For The Sting, adapt the template like this:

**Slide 1**

THE STING

Lovejoy Series 1 Episode 3

Image slot (my reference — leave the slide's placeholder empty): Lovejoy at the auction rostrum, or the ensemble caper crew (Lovejoy / Tinker / Eric / Lady Jane).

**Slide 2**

PLOT IN ONE WINK

Lovejoy's first proper caper. A reformed junkie hires him to recover statuettes she pinched from her dying father; Charlie Gimbert double-crosses him at the auction; revenge comes via a long con featuring a forger, a barker, a vegan apprentice, an addict and an aristocrat.

Image slot (my reference — leave the slide's placeholder empty): stolen statuettes + a wink + Gimbert looking smug.

**Slide 3**

DIVVY OBSERVATION

A wink is as good as a flag to an auctioneer — the entire premise of the divvy in one tidy sentence.

or

The first time the ensemble pulls a job together, and the show works out what it is.

Image slot (my reference — leave the slide's placeholder empty): Lovejoy winking to camera / bidders in an auction house.

**Slide 4**

VERDICT

This is the one.

The whole crew pulling a job together.

If you've never seen Lovejoy in your life, watch this one first.

⭐⭐⭐⭐⭐

Image slot (my reference — leave the slide's placeholder empty): the four of them lined up — Lovejoy, Eric, Tinker, Lady Jane.

**Slide 5**

QUOTE + SCORE

"I need you, Lovejoy. Since my wife died, I need someone to hate."

⭐⭐⭐⭐⭐

Then underneath:

Full review at TheDivvy.co.uk

---

## Notes when adapting

- **Headline quote (Slide 5)**: pick the most quotable line of the episode, not necessarily the most show-defining. The dramatic beat usually beats the catchphrase here.
- **Divvy Observation (Slide 3)**: give Canva two options so you can choose at design time. One can be show-defining, the other episode-specific.
- **Verdict (Slide 4)**: three short lines, each on its own line. The third line is the "tying it together" beat.
- **Stars**: use full ⭐ for whole points, ⭐½ for halves. The site uses out-of-5 scoring.
- **Image slots**: short, evocative, comma-separated. Canva is told
  explicitly not to generate or touch images — these lines are just
  reminders for you when it comes time to drop the right screenshot in.
