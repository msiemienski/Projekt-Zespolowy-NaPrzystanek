"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RegisterComp({ onClose, showRegister }) {
  const handleRegisterCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePasswordLocal(pwd, pwdRepeat) {
    if (pwd !== pwdRepeat) {
      return "Hasła muszą być jednakowe.";
    }
    if (pwd.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Hasło musi zawierać co najmniej jedną wielką literę.";
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      return "Hasło musi zawierać co najmniej jeden znak specjalny.";
    }
    return null;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validatePasswordLocal(password, passwordRepeat);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const name =
        email && email.includes("@")
          ? email.split("@")[0]
          : "Użytkownik";

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Nie udało się zarejestrować");
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showRegister && (
        <motion.div
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
              className="w-11/12 h-auto max-h-[90%] bg-white rounded-3xl shadow-xl flex flex-col overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-row items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold">Rejestracja</h2>
                <button
                  onClick={handleRegisterCloseClick}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center w-full mx-auto p-4 gap-4">
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

                <input
                  type="password"
                  placeholder="Powtórz hasło"
                  className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                />

                <div className="w-full text-xs text-gray-500">
                  Hasło musi mieć co najmniej 8 znaków, zawierać jedną wielką literę
                  oraz jeden znak specjalny.
                </div>

                {error && (
                  <p className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="text-lg sm:text-xl font-bold text-blue-600 bg-white rounded-xl px-6 py-2 shadow-md hover:bg-blue-50 transition-all duration-300 cursor-pointer mt-2 disabled:opacity-60"
                >
                  {loading ? "Rejestrowanie..." : "Zarejestruj się"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
