"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { authFetch } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setFirebaseUser(user);

      if (!user) {
        setDbUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const data = await authFetch(user, "/api/auth/me");
        setDbUser(data.user);
      } catch (error) {
        console.error("Could not load Trackstead user:", error.message);
        setDbUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      dbUser,
      authLoading,
      isLoggedIn: Boolean(firebaseUser)
    }),
    [firebaseUser, dbUser, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}