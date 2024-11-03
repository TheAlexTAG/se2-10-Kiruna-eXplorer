const SERVER_URL = "http://localhost:3001/api";

const login = async (username: string, password: string) => {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return await response.json();
};

const logout = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return await response;
};

const currentUser = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sessions failed");
  }

  return await response.json();
};

const API = { login, logout, currentUser };
export default API;
