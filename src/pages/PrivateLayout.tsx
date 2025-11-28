// src/layouts/PrivateLayout.jsx
import { Navigate, Outlet } from "react-router-dom";
import '../styles/PrivateLayout.css';
import NavBar from "../components/NavBar";

const PrivateLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NavBar />
      {/* Espaçamento controlado pelo layout, não pelo body */}
      <div className="layoutContent">
        <Outlet />
      </div>
    </>
  );
};

export default PrivateLayout;
