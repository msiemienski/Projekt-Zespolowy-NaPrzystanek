"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";

export default function AdminPanelComp({ onClose, showAdminPanel }) {
  if (!showAdminPanel) return null;

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <AnimatePresence>
      {showAdminPanel && (
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
                <div className="flex flex-row items-center gap-2">
                   <ShieldAlert className="w-6 h-6 text-red-600" />
                   <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Panel Administratora</h2>
                </div>
                <button
                  onClick={handleCloseClick}
                  className="p-1 rounded-full transition"
                  style={{ color: 'var(--icon-primary)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col p-6 gap-6 items-center text-center">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Witaj w strefie zarządzania!
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Tutaj w przyszłości znajdą się narzędzia do zarządzania użytkownikami, trasami i systemem.
                </p>
                
                <div className="p-4 rounded-xl border border-dashed border-gray-400 w-full">
                  <span className="text-sm font-mono text-gray-500">TODO: Lista użytkowników, Statystyki, Logi</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
