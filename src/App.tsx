import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import EpisodePage from "./pages/EpisodePage";
import SeriesIndexPage from "./pages/SeriesIndexPage";
import SeriesPage from "./pages/SeriesPage";
import ArchivePage from "./pages/ArchivePage";
import OverviewPage from "./pages/OverviewPage";
import CharactersPage from "./pages/CharactersPage";
import AboutPage from "./pages/AboutPage";
import ExternalLinksPage from "./pages/ExternalLinksPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/series" element={<SeriesIndexPage />} />
        <Route path="/series/:id" element={<SeriesPage />} />
        <Route path="/episodes/:slug" element={<EpisodePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/lovejoy-overview" element={<OverviewPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/links" element={<ExternalLinksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
