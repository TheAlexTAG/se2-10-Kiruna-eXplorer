import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Login } from "./components/Login/Login";
import { TopBar } from "./components/TopBar/TopBar";

import { Map } from "./components/Map/Map";
import { useAuth } from "./contexts/GlobalStateProvider";
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
        <Route path="/map" element={<Map />} />
      </Routes>
    </>
  );
}

export default App;
