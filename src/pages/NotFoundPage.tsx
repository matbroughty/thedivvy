import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFoundPage() {
  return (
    <div className="page page--narrow" style={{ textAlign: "center" }}>
      <Seo title="Not found" noindex />
      <h1>Not found</h1>
      <p className="hero__summary">
        Tinker swears it was here a minute ago. Try one of these:
      </p>
      <p>
        <Link to="/">Home</Link> &middot; <Link to="/archive">Archive</Link>{" "}
        &middot; <Link to="/lovejoy-overview">Overview</Link>
      </p>
    </div>
  );
}
