import { useState } from "react";
import Seo from "../components/Seo";
import "../styles/bingo.css";

const squares = [
  "Lovejoy speaks to camera",
  "Eric chases someone on his bike",
  "Jane asks Lovejoy for a favour",
  "A hallmark gets a close-up",
  "Tinker has a drink",
  "Lovejoy gets a divvy feeling",
  "Eric is told to keep watch",
  "‘Not Mister. Just Lovejoy.’",
  "An auction bid is barely visible",
  "Lovejoy spots a fake",
  "Tinker breaks into song",
  "Someone turns up to collect a debt",
  "Jane explains how she knows Lovejoy",
  "A deal is done in the pub",
  "Lovejoy gives the camera a look",
  "Tinker puts on a posh voice",
];

const patterns = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
  [0, 5, 10, 15], [3, 6, 9, 12], // Diagonals
  [0, 3, 12, 15], // Four corners
  [5, 6, 9, 10], // Centre four
];

export default function BingoPage() {
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const wins = patterns.filter((pattern) => pattern.every((index) => marked.has(index)));
  const winningSquares = new Set(wins.flat());

  function toggleSquare(index: number) {
    setMarked((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <article className="article bingo">
      <Seo
        title="Lovejoy Bingo"
        description="Play along with any episode of Lovejoy. Sixteen squares and twelve ways to call bingo."
      />
      <header className="article__head">
        <h1 className="article__title">Lovejoy Bingo</h1>
        <p className="article__summary">Play along with a pint, a cuppa or a pencil.</p>
      </header>

      <p className="bingo__rules" id="bingo-rules">
        Tap a square when you spot it. Complete a row, column, diagonal, all
        four corners or the middle four squares to call bingo.
      </p>
      <div className="bingo__card" role="group" aria-label="Bingo card" aria-describedby="bingo-rules">
        {squares.map((label, index) => (
          <button
            key={label}
            type="button"
            className={winningSquares.has(index) ? "bingo__square bingo__square--win" : "bingo__square"}
            aria-pressed={marked.has(index)}
            onClick={() => toggleSquare(index)}
          >
            <span>{label}</span>
            <span className="bingo__check" aria-hidden="true">{marked.has(index) ? "✓" : "·"}</span>
          </button>
        ))}
      </div>
      <div className="bingo__controls">
        <p role="status">
          {wins.length > 0 && <strong>Bingo! </strong>}
          {wins.length} of {patterns.length} patterns complete
        </p>
        <button type="button" onClick={() => setMarked(new Set())}>Reset card</button>
      </div>
      <p className="bingo__credit">
        Inspired by the <a href="https://www.lovejoyactually.com/listen?offset=1554271200834">Lovejoy Actually</a> podcast.
      </p>
    </article>
  );
}
