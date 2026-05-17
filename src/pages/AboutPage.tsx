import Seo from "../components/Seo";

export default function AboutPage() {
  return (
    <article className="article">
      <Seo
        title="About — Lovejoy reviews"
        description="The Divvy is written by Mat, in Chislehurst, with warm nostalgia for watching Lovejoy with his mum. Get in touch at mat@broughty.com."
      />
      <header className="article__head">
        <div className="article__eyebrow">Behind the divvy</div>
        <h1 className="article__title">About</h1>
        <p className="article__summary">Mat. Chislehurst. Hello.</p>
      </header>

      <div className="article__body">
        <p>
          I watched <em>Lovejoy</em> with my mum. That's where it starts,
          really — the lounge, Mum commenting on how dishy Ian McShane was,
          Dad pointing out that he was a short arse.
        </p>

        <p>
          Over the (many) years I've kept coming back . <em>Lovejoy</em> served as my
          work avatar for an impressive stretch of time, until HR (rebranded People Team nowadays I think) gently
            enforced something a bit more recognisable.
            I've ended up in Chislehurst, whose only meaningful link to the world of antiques is that Catherine Southon from{" "}
          <em>Bargain Hunt</em> runs an auction house here. Lovejoy, Tinker et al would
          approve.
        </p>

        <p>
          Modern tech has eroded my attention span to approximately that of a
          drunk squirrel, so the plan — review every episode, weekly, for the
          next eighteen months or so — is part enjoyment, part discipline test. Let's see how much I end up cheating with AI.
        </p>

        <p>
          Drop me a line at{" "}
          <a href="mailto:mat@broughty.com">mat@broughty.com</a>.
        </p>

        <p style={{ marginTop: "2rem", textAlign: "right", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-text-muted)" }}>
          — Mat
        </p>
      </div>
    </article>
  );
}
