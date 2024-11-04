import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Login } from "./components/Login/Login";
import { TopBar } from "./components/TopBar/TopBar";
import Document from "./components/Document/Document";
import API from "./API/API";
import { useAuth } from "./contexts/GlobalStateProvider";
import GeoreferenceDocument from "./components/Georeference/Georeference";

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <>
      {location.pathname !== "/login" && <TopBar user={user} logout={logout} />}
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/document" element={<Document />} />
        <Route path="/map" element={<GeoreferenceDocument />} />
      </Routes>
    </>
  );
}

export default App;
