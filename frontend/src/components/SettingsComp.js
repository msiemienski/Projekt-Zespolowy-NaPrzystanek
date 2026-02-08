"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

const SettingsComp = ({ onClose, showSettings, currentUser }) => {
  // 1. Podstawowe ustawienia API i zamknięcia
  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // 2. Hooki dla motywu i prostych ustawień lokalnych
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoLocation, setAutoLocation] = useState(false);

  // 3. Stan formularza zmiany hasła (pola tekstowe, ładowanie, błędy)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // 4. Wczytywanie zapisanych ustawień przy starcie
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    const savedAutoLocation = localStorage.getItem("autoLocation");
    if (savedNotifications !== null) setNotifications(savedNotifications === "true");
    if (savedAutoLocation !== null) setAutoLocation(savedAutoLocation === "true");
  }, []);

  // 5. Obsługa zmiany prostych ustawień
  const handleNotificationsChange = (value) => {
    setNotifications(value);
    localStorage.setItem("notifications", value.toString());
  };

  const handleAutoLocationChange = (value) => {
    setAutoLocation(value);
    localStorage.setItem("autoLocation", value.toString());
  };

  // 6. Główna funkcja wysyłająca żądanie zmiany hasła
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    // A. Walidacja: Czy hasła się zgadzają?
    if (newPassword !== confirmPassword) {
      setPassError("Nowe hasła nie są identyczne.");
      return;
    }

    setPassLoading(true);
    try {
      // B. Wysłanie zapytania do Backendu
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ważne dla obsługi ciasteczek (JWT)
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      // C. Obsługa wyniku
      if (!res.ok) {
        setPassError(data.message || "Nie udało się zmienić hasła.");
      } else {
        setPassSuccess("Hasło zostało zmienione pomyślnie!");
        // Czyścimy pola po sukcesie
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPassError("Błąd połączenia z serwerem.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div
              className="w-11/12 h-auto max-h-[90%] rounded-3xl shadow-xl flex flex-col overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-main)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nagłówek okna */}
              <div className="flex flex-row items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Ustawienia</h2>
                <button
                  onClick={handleCloseClick}
                  className="p-1 rounded-full transition"
                  style={{ color: 'var(--icon-primary)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-6">
                
                {/* SEKCJA ZMIANY HASŁA (tylko dla zalogowanych) */}
                {currentUser && (
                  <div className="flex flex-col p-4 rounded-xl gap-3" style={{ backgroundColor: 'var(--bg-section)' }}>
                    <div className="flex flex-row items-center gap-3 mb-1">
                       <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Bezpieczeństwo: Zmień hasło</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <input
                        type="password"
                        placeholder="Obecne hasło"
                        className="w-full h-10 border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Nowe hasło"
                        className="w-full h-10 border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Powtórz nowe hasło"
                        className="w-full h-10 border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      
                      {/* Komunikaty o błędach i sukcesie */}
                      {passError && <p className="text-sm text-red-500 font-medium">{passError}</p>}
                      {passSuccess && <p className="text-sm text-green-500 font-medium">{passSuccess}</p>}

                      <button
                        onClick={handleChangePassword}
                        disabled={passLoading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 disabled:opacity-50"
                      >
                        {passLoading ? "Przetwarzanie..." : "Zatwierdź nowe hasło"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sekcja: Wybór motywu */}
                <div className="flex flex-row items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-section)' }}>
                  <div className="flex flex-row items-center gap-3">
                    <Palette className="w-5 h-5" style={{ color: 'var(--icon-primary)' }} />
                    <div className="flex flex-col">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Motyw</span>
                      <span className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
                        {theme === "dark" ? "Ciemny" : "Jasny"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative w-14 h-8 bg-blue-600 dark:bg-blue-500 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        theme === "dark" ? "translate-x-6" : "translate-x-0"
                      }`}
                    >
                      {theme === "dark" ? (
                        <Moon className="w-4 h-4 text-blue-600 m-1" />
                      ) : (
                        <Sun className="w-4 h-4 text-yellow-500 m-1" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Powiadomienia */}
                <div className="flex flex-row items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-section)' }}>
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Powiadomienia</span>
                    <span className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
                      Otrzymuj powiadomienia o zmianach w trasach
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => handleNotificationsChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Automatyczna lokalizacja */}
                <div className="flex flex-row items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-section)' }}>
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Automatyczna lokalizacja</span>
                    <span className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
                      Automatycznie wykrywaj twoją lokalizację
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoLocation}
                      onChange={(e) => handleAutoLocationChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsComp;
