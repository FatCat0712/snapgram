import { getCurrentUser } from "@/lib/appwrite/api";
import { type IUser, type IContextType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE: IContextType = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const checkAuthUser = async () => {
    try {
      setIsLoading(true);
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        });
        setIsAuthenticated(true);
        return true;
      }

      // No user found - set to unauthenticated
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Error checking auth user:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const syncAuthState = async () => {
      const cookieFallback = localStorage.getItem("cookieFallback");

      // Skip account check when local state explicitly marks user as signed out.
      if (cookieFallback === "[]") {
        setUser(INITIAL_USER);
        setIsAuthenticated(false);

        if (pathname !== "/sign-in" && pathname !== "/sign-up") {
          navigate("/sign-in");
        }
        return;
      }

      await checkAuthUser();
    };

    syncAuthState();
  }, [navigate, pathname]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within an AuthProvider");
  }
  return context;
};
