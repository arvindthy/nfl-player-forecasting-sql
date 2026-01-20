import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/components/AppShell";
import LandingPage from "@/pages/LandingPage";
import ForecastExplorer from "@/pages/ForecastExplorer";
import GamesPage from "@/pages/GamesPage";
import PlayersPage from "@/pages/PlayersPage";
import AboutPage from "@/pages/AboutPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="forecasting" element={<ForecastExplorer />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
