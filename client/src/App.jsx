import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Onboarding from "./pages/Onboarding/Onboarding";
import Dashboard from "./pages/Dashboard/Dashboard";
import Languages from "./pages/Languages/Languages";
import LanguageOverview from "./pages/Languages/LanguageOverview";
import ModulePage from "./pages/Languages/ModulePage";
import ExamPage from "./pages/Languages/ExamPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/languages" element={<Languages />} />
      <Route
        path="/languages/:languageId"
        element={<LanguageOverview />}
      />
      <Route
        path="/languages/:languageId/modules/:moduleSlug"
        element={<ModulePage />}
      />
      <Route
        path="/languages/:languageId/exam/:levelId"
        element={<ExamPage />}
      />
    </Routes>
  );
}