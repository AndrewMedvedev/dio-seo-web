import { Routes, Route } from "react-router-dom";
import Registration from "./auth/registration";
import Login from "./auth/login";
import Invitation from "./auth/invitations";
import Header from "./components/layout/Header";
import PromotionPage from "./components/seo";
import ContentGenerationPage from "./components/generateContent";
const App = () => {
  return (
    <>
      <Header></Header>
      <Routes>
        <Route path="/invitation" element={<Invitation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/seo" element={<PromotionPage />} />
        <Route path="//generate/content" element={<ContentGenerationPage />} />
      </Routes>
    </>
  );
};

export default App;
