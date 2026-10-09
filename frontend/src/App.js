import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import MatchesPage from "@/pages/MatchesPage";
import ScoutPage from "@/pages/ScoutPage";

function App() {
  return (
    <div className="App min-h-screen">
      <HashRouter>
        <Routes>
          <Route path="/" element={<MatchesPage />} />
          <Route path="/match/:id" element={<ScoutPage />} />
        </Routes>
      </HashRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
