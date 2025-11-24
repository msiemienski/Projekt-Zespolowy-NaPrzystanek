"use client";
import { motion } from "framer-motion";

export default function LoadingSpinner({
  message = "Ładowanie...",
  size = "md",
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-b-2",
    lg: "h-16 w-16 border-b-2",
  };

  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center p-8 min-h-[200px]"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <motion.div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-600`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-blue-600 font-semibold text-center"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
