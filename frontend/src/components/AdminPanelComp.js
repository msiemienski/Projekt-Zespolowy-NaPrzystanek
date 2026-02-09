"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminPanelComp({ onClose, showAdminPanel }) {
  const [topSearches, setTopSearches] = useState([]);

  useEffect(() => {
    if (showAdminPanel) {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      fetch(`${apiUrl}/api/admin/top-searches`, {
        credentials: 'include'
      })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setTopSearches(data))
      .catch(err => console.error("Error fetching top searches:", err));
    }
  }, [showAdminPanel]);

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
                
                <div className="w-full text-left">
                  <h4 className="text-md font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Top 5 Wyszukiwań</h4>
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fraza</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liczba wyszukiwań</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {topSearches.length > 0 ? (
                          topSearches.map((search, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{search.query}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{search.count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">Brak danych</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
