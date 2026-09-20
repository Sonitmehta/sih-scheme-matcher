import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import MatchPage from "./pages/MatchPage";
import "./index.css";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/match" element={<MatchPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
