import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { Login } from "./components/Login/Login";
import { TopBar } from "./components/TopBar/TopBar";
import { useAuth } from "./contexts/GlobalStateProvider";
import GeoreferenceDocument from "./components/DocumentsMap/DocumentsMap";
import { Alert } from "react-bootstrap"; // Importa l'Alert di react-bootstrap
import { DocumentList } from "./components/Document/DocumentList";

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {location.pathname !== "/login" && <TopBar user={user} logout={logout} />}
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<GeoreferenceDocument />} />

        <Route
          path="/document"
          element={
            user?.role === "Urban Planner" || user?.role === "Admin" ? (
              <DocumentList userInfo={user} />
            ) : (
              <div className="center-alert">
                <Alert variant="danger">
                  Access denied. Only the urban planner can access this page
                </Alert>
              </div>
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
