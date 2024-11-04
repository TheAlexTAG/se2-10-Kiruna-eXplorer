import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import "./Login.css";
import { useState } from "react";
import API from "../../API/API";
import { useNavigate } from "react-router-dom";
export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Please enter both username and password");
      return;
    }

    API.login(username, password)
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
