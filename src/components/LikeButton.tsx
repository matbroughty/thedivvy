import { useEffect, useState } from "react";
import {
  getLikes,
  incrementLikes,
  hasLiked,
  markLiked,
} from "../lib/likes";

export default function LikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLiked(hasLiked(slug));
    setCount(null);
    getLikes(slug).then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleClick = async () => {
    if (liked || pending) return;
    setPending(true);
    const previous = count;
    setCount((previous ?? 0) + 1);
    setLiked(true);
    try {
      const newCount = await incrementLikes(slug);
      setCount(newCount);
      markLiked(slug);
    } catch {
      setCount(previous);
      setLiked(false);
    } finally {
      setPending(false);
    }
  };

  const label = liked ? "You liked this episode" : "Like this episode";

  return (
    <div className="like-button-wrap">
      <button
        type="button"
        className={`like-button${liked ? " like-button--liked" : ""}`}
        onClick={handleClick}
        disabled={liked || pending}
        aria-label={label}
        aria-pressed={liked}
      >
        <span className="like-button__heart" aria-hidden>
          {liked ? "♥" : "♡"}
        </span>
        <span className="like-button__label">{liked ? "Liked" : "Like"}</span>
        {count !== null && (
          <span className="like-button__count" aria-hidden>
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
