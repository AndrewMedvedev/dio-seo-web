import { Routes, Route } from "react-router-dom";
import Registration from "./auth/registration";
import Login from "./auth/login";
import Invitation from "./auth/invitations";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/invitation" element={<Invitation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </>
  );
};

export default App;
