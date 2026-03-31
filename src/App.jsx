import { Routes, Route } from "react-router-dom";
import Registration from "./auth/registration";
import Login from "./auth/login";
import Invitation from "./auth/invitations";
import ContentGenerationPage from "./pages/GenerateContent";
import PromotionPage from "./pages/PromotionPage";
import { MainLayout, AuthLayout } from "./components/layout/layout";
const App = () => {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/seo" element={<PromotionPage />} />
          <Route path="/generate/content" element={<ContentGenerationPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
