"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full bg-[var(--background)] dark:bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-12 h-12 text-blue-600 dark:text-blue-400"
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "linear" 
        }}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
      <motion.span
        className="text-blue-700 dark:text-blue-300 mt-4 font-medium text-sm"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.2,
          duration: 0.4 
        }}
      >
        Ładowanie mapy...
      </motion.span>
    </motion.div>
  );
}
