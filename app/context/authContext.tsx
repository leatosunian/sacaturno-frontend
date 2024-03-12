"use client";
import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useReducer,
  useEffect,
} from "react";

const authInitialState = {
  userID: "",
  token: "",
};

type authAction = { type: "saveAuthData"; payload: IAuthContextState };

export interface IAuthContextState {
  userID: string;
  token: string | null;
}

export type authContextProps = {
  authState: IAuthContextState;
  saveAuthData: (loginData: IAuthContextState) => void;
  loading: boolean;
};

export const AuthContext = createContext<authContextProps>(
  {} as authContextProps
);

export const authReducer = (state: IAuthContextState, action: authAction) => {
  switch (action.type) {
    case "saveAuthData":
      return {
        ...state,
        userID: action.payload.userID,
        token: action.payload.token,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, dispatch] = useReducer(authReducer, authInitialState);
  const [loading, setLoading] = useState(true);

  const saveAuthData = (loginData: IAuthContextState) => {
    dispatch({ type: "saveAuthData", payload: loginData });
  };

  useEffect(() => {
    const token = localStorage.getItem("sacaturno_token");
  }, []);

  return (
    <AuthContext.Provider value={{ authState, saveAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
