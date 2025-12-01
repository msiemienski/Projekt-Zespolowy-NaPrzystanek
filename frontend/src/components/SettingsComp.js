"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

const SettingsComp = ({ onClose, showSettings }) => {
  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoLocation, setAutoLocation] = useState(false);

  // Wczytaj preferencje z localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    const savedAutoLocation = localStorage.getItem("autoLocation");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
    if (savedAutoLocation !== null) {
      setAutoLocation(savedAutoLocation === "true");
    }
  }, []);

  const handleNotificationsChange = (value) => {
    setNotifications(value);
    localStorage.setItem("notifications", value.toString());
  };

  const handleAutoLocationChange = (value) => {
    setAutoLocation(value);
    localStorage.setItem("autoLocation", value.toString());
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
              <div className="flex flex-row items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Ustawienia</h2>
                <button
                  onClick={handleCloseClick}
                  className="p-1 rounded-full transition"
                  style={{ color: 'var(--icon-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dropdown-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="w-6 h-6" style={{ color: 'var(--icon-primary)' }} />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-6">
                {/* Motyw */}
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
