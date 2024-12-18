import { Alert, Button, Form } from "react-bootstrap";
import "./Login.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/GlobalStateProvider";
export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const root = document.getElementById("root");
    root.style.height = "100vh";
    return () => {
      root.style.height = "";
    };
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Please enter both username and password");
      return;
    }

    login(username, password)
      .then(() => {
        navigate("/");
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      });
  };
  return (
    <div className="w-100 h-100 login-main">
      <div className="h-100">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="image-cover"></div>
          <div className="d-flex justify-content-center align-items-center login-form">
            <div className="w-100 m-4">
              <i
                className="bi bi-house"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/")}
              ></i>
              <div className="text-center mb-4">
                <h1>Login</h1>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <div>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-4"
                  >
                    Submit
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
