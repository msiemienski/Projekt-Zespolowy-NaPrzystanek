"use client";

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useState, useEffect, useRef } from "react";
import RegisterComp from "./RegisterComp";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const LoginComp = ({ onClose, showLogin }) => {
  const handleLoginCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };


  const [showRegister, setShowRegister] = useState(false);

  // stan formularza logowania klasycznego
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // przycisk Google
  const googleButtonRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Nie udało się zalogować");
        setLoading(false);
        return;
      }

      onClose();
      setLoading(false);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  };

  // Inicjalizacja przycisku Google, gdy modal jest otwarty
  useEffect(() => {
    if (!showLogin) return;
    if (typeof window === "undefined") return;
    if (!window.google) return;
    if (!googleButtonRef.current) return;
    if (!GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_BASE}/api/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ idToken: response.credential })
          });

          if (res.ok) {
            onClose();
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          } else {
            // Możesz tu dodać setError z komunikatem, jeśli chcesz
          }
        } catch (e) {
          // Możesz tu dodać setError z komunikatem, jeśli chcesz
        }
      }
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill"
    });
  }, [showLogin]);


  // stan formularza logowania klasycznego
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // przycisk Google
  const googleButtonRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Nie udało się zalogować");
        setLoading(false);
        return;
      }

      onClose();
      setLoading(false);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  };

  // Inicjalizacja przycisku Google, gdy modal jest otwarty
  useEffect(() => {
    if (!showLogin) return;
    if (typeof window === "undefined") return;
    if (!window.google) return;
    if (!googleButtonRef.current) return;
    if (!GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_BASE}/api/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ idToken: response.credential })
          });

          if (res.ok) {
            onClose();
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          } else {
            // Możesz tu dodać setError z komunikatem, jeśli chcesz
          }
        } catch (e) {
          // Możesz tu dodać setError z komunikatem, jeśli chcesz
        }
      }
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill"
    });
  }, [showLogin]);

  return (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex items-center justify-center z-50 text-blue-600"
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex items-center justify-center z-50 text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div
              className="w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 h-3/4 bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold">Logowanie</h2>
                <button
                  onClick={handleLoginCloseClick}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center w-full sm:w-2/3 mx-auto p-4 sm:p-6 md:p-10 gap-4">
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Hasło"
                  className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                  <p className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="text-lg sm:text-xl font-bold text-blue-600 bg-white rounded-xl px-6 py-2 shadow-md hover:bg-blue-50 transition-all duration-300 cursor-pointer mt-2 disabled:opacity-60"
                >
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </button>

                <div className="w-full flex flex-col items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">lub</span>
                  <div ref={googleButtonRef} />
                </div>

                <div className="flex flex-row items-center justify-center flex-wrap text-sm sm:text-base mt-4">
                  Nie masz konta?
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-black hover:text-blue-800 transition-colors cursor-pointer underline p-1"
                  >
                    Zarejestruj się
                  </button>
                </div>

                <RegisterComp
                  onClose={() => setShowRegister(false)}
                  showRegister={showRegister}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
};

export default LoginComp;
