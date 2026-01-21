import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import LandingPage from "@/pages/LandingPage";
import ForecastExplorer from "@/pages/ForecastExplorer";
import GamesPage from "@/pages/GamesPage";
import TeamsPage from "@/pages/TeamsPage";
import TeamDashboard from "@/pages/TeamDashboard";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import AboutPage from "@/pages/AboutPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="forecasting" element={<ForecastExplorer />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="players" element={<Navigate to="/teams" replace />} />
          <Route path="players/:playerId" element={<PlayerProfilePage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:teamCode" element={<TeamDashboard />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
