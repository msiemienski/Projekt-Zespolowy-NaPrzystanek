import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
const SettingsComp = ({ onClose, children, title, showSettings }) => {
  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="absolute top-0 left-0 inset-0 bg-black/50 flex items-center justify-center z-50 h-full w-full text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.42, 0.97, 0.52, 1.49] }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1.05, opacity: 1, y: 3 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="min-w-[600px] max-w-[800px] min-h-160 max-h-160 bg-white rounded-lg p-4 shadow-2xl">
              <div className="flex justify-end mb-4">
                <a
                  href="#"
                  onClick={handleCloseClick}
                  className="text-2xl font-bold text-gray-600 hover:text-black transition-colors cursor-pointer no-underline"
                >
                  <X className="w-6 h-6 text-blue-600"/>
                </a>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsComp;
