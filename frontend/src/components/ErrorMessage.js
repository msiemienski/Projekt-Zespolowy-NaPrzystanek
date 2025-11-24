"use client";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorMessage({
  message = "Wystąpił błąd podczas pobierania danych.",
  details = null,
  onRetry = null,
  onDismiss = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border-2 border-red-200 rounded-xl m-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
      </motion.div>

      <h3
        className="text-red-600 font-bold text-lg mb-2"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        Błąd
      </h3>

      <p className="text-gray-700 font-semibold mb-1">{message}</p>

      {details && (
        <p className="text-gray-600 text-sm mt-2 max-w-md">{details}</p>
      )}

      <div className="flex flex-row gap-3 mt-4">
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-row items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Spróbuj ponownie
          </motion.button>
        )}

        {onDismiss && (
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-row items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            <X className="w-4 h-4" />
            Zamknij
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
