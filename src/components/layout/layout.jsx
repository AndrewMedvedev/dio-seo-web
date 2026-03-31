import { Outlet } from "react-router-dom";
import Header from "./Header";

export function MainLayout() {
  return (
    <>
      <Header /> {/* здесь header всегда закреплён */}
      <main>
        <Outlet /> {/* сюда рендерятся дочерние страницы */}
      </main>
    </>
  );
}

export function AuthLayout() {
  return <Outlet />;
}
