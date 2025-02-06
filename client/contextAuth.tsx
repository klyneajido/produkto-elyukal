import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@supabase/supabase-js";  // Import User type
import { supabase } from "./supabaseClient"; // Import supabase client

// Define the shape of your context
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;  // Ensure setUser is included
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();  // Fetch session
      console.log("Initial auth session:", { session, error });

      if (session && session.user) {
        setUser(session.user);  // Set user if session exists
      } else {
        console.log("No session found.");
      }
    };

    fetchSession(); // Fetch session on mount

    // Listen for auth state changes (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", { event: _event, session });
      if (session?.user) {
        setUser(session.user); // Update user state if session contains a user
      } else {
        setUser(null);  // Clear user state if session doesn't contain a user
        console.log("User logged out.");
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
        console.log("Auth listener unsubscribed.");
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
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
