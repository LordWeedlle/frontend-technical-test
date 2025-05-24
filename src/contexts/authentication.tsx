import { jwtDecode } from "jwt-decode";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthenticationState =
  | {
      isAuthenticated: true;
      token: string;
      userId: string;
    }
  | {
      isAuthenticated: false;
    };

export type Authentication = {
  state: AuthenticationState;
  authenticate: (token: string) => void;
  signout: () => void;
};

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined,
);

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthenticationState>({
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (token) {
      try {
        const { id } = jwtDecode<{ id: string }>(token);
        setState({ isAuthenticated: true, token, userId: id });
      } catch (e) {
        console.error('Invalid token in localStorage:', e);
        localStorage.removeItem('jwt');
      }
    }
  }, []);

  const authenticate = useCallback(
    (token: string) => {
      localStorage.setItem('jwt', token);

      setState({
        isAuthenticated: true,
        token,
        userId: jwtDecode<{ id: string }>(token).id,
      });
    },
    [setState],
  );

  const signout = useCallback(() => {
    localStorage.removeItem('jwt');

    setState({ isAuthenticated: false });
  }, [setState]);

  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout],
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider",
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error("User is not authenticated");
  }
  return state.token;
}
