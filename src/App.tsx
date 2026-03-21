import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import LoginPage from "./components/LoginPage";
import MainApp from "./components/MainApp";

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_USER_EMAIL;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkAccess(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAccess(session);
      } else {
        setSession(null);
        setAccessDenied(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  function checkAccess(session: Session) {
    if (ALLOWED_EMAIL && session.user.email !== ALLOWED_EMAIL) {
      setAccessDenied(true);
      setSession(null);
      setLoading(false);
      // Sign out after a delay so error message is visible
      setTimeout(() => supabase.auth.signOut(), 10000);
      return;
    }
    setSession(session);
    setAccessDenied(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (accessDenied) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "500px",
          margin: "4rem auto",
          textAlign: "center",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ color: "#856404", marginTop: 0 }}>⛔ Access Denied</h1>
        <p
          style={{ fontSize: "1.1rem", color: "#856404", marginBottom: "1rem" }}
        >
          This is a personal app — access is restricted to the owner. Want your
          own?{" "}
          <a
            href="https://github.com/AMilburn/leveled"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fork the repo on GitHub
          </a>
        </p>
      </div>
    );
  }

  return session ? <MainApp session={session} /> : <LoginPage />;
}
