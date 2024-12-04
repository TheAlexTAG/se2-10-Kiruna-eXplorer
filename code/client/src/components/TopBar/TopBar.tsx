import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./TopBar.css";
import { useState } from "react";

export const TopBar = ({ user, logout }: TopBarProps) => {
  const [showNavbar, setShowNavbar] = useState(false);
  const handleNavbar = () => {
    setShowNavbar(!showNavbar);
  };
  return (
    <>
      <Navbar className="d-flex justify-content-between navbar-component pt-2 pb-0 mx-4">
        <Navbar.Brand as={Link} to="/">
          <img
            src="./src/assets/Kiruna_vapen.png"
            style={{ width: "36px", marginRight: "8px" }}
          />
          Kiruna Explorer
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {!showNavbar && (
            <div className="navbar-list-icon">
              <i className="bi bi-list" onClick={handleNavbar}></i>
            </div>
          )}
          <Nav className={showNavbar ? "navbar-mobile" : "navbar-mobile-hide"}>
            {showNavbar && (
              <div className="d-flex justify-content-end mx-2 mt-1">
                <i className="bi bi-x-lg" onClick={handleNavbar}></i>
              </div>
            )}
            <Link className="nav-link" to="/">
              Home
            </Link>
            <Link className="nav-link" to="/document">
              Documents
            </Link>
            <Link className="nav-link" to="/diagram">
              Diagram
            </Link>
            <Link className="nav-link" to="/map">
              Map
            </Link>
            {user ? (
              <a
                className="nav-link text-danger"
                style={{ cursor: "pointer" }}
                onClick={logout}
              >
                Logout
              </a>
            ) : (
              <Link className="nav-link" to="/login">
                Login
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <hr className="mx-2 main-text" />
    </>
  );
};

interface User {
  id: string;
  role: string;
  username: string;
}

interface TopBarProps {
  user: User | null;
  logout: () => void;
}
