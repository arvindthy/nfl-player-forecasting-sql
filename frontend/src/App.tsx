import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ForecastExplorer from "@/pages/ForecastExplorer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forecasts" element={<ForecastExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}


