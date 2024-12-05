import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { Login } from "./components/Login/Login";
import { TopBar } from "./components/TopBar/TopBar";
import { useAuth } from "./contexts/GlobalStateProvider";
import DocumentsMap from "./components/DocumentsMap/DocumentsMap";
import { DocumentList } from "./components/Document/DocumentList";
import { Home } from "./components/Home/Home";
import { Diagram } from "./components/Diagram/Diagram";

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {location.pathname !== "/login" && <TopBar user={user} logout={logout} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<DocumentsMap />} />
        <Route path="/document" element={<DocumentList userInfo={user} />} />
        <Route path="/diagram" element={<Diagram />} />
      </Routes>
    </>
  );
}

export default App;
