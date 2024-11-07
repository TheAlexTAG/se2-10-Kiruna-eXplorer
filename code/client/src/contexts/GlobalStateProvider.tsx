import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import API from "../API/API";

interface User {
  id: string;
  role: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const GlobalAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const res = await API.login(username, password);
      setUser(res);
    } catch (error: any) {
      console.error("Error logging in:", error?.message);
      setUser(null);
      throw new Error(error?.message || "Unknown error");
    }
  };

  const logout = async () => {
    try {
      await API.logout();
      fetchCurrentUser();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const fetchCurrentUser = async () => {
    try {
      const res = await API.currentUser();
      setUser(res);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setUser(null);
    }
  };
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a GlobalAuthProvider");
  }
  return context;
};
