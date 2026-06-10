import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function loadUserProfile(user) {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    const profile = userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
    setUserProfile(profile);
    return profile;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError("");
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        await loadUserProfile(user);
      } catch (error) {
        setAuthError(error.message);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      authError,
      currentUser,
      loading,
      refreshUserProfile: () => (currentUser ? loadUserProfile(currentUser) : null),
      role: userProfile?.role,
      signOut: () => firebaseSignOut(auth),
      userProfile,
    }),
    [authError, currentUser, loading, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
