import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface GuestUser {
  guest: boolean;
}
type UserType = User | GuestUser | null;

interface AuthContextType {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  loading: boolean;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AuthProvider - Initial session:", { session, error });

        if (session?.user) {
            setUser(session.user);
            console.log("AuthProvider - Set user from session:", session.user);
        } else {
            console.log("AuthProvider - No session, user remains:", user);
        }
        setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("AuthProvider - Auth state change:", { event: _event, session });
        if (session?.user) {
            setUser(session.user);
        } else {
            setUser(null);
        }
        console.log("AuthProvider - Updated user:", user);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
}, []);
  

  // ✅ Log guest mode activation
  const loginAsGuest = () => {
    setUser({ guest: true });
    console.log("🟢 Guest mode activated! New user state:", { guest: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
