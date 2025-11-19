import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function RegisterComp({ onClose, showRegister }) {
    const handleRegisterCloseClick = (e) => {
        e.preventDefault();
        onClose();
    };
    return (
        <AnimatePresence>
        {showRegister && (
                <motion.div
                    className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 rounded-lg flex items-center justify-center z-50 text-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.42, 0.97, 0.52, 1.49] }}
                    onClick={onClose}
                >
                <motion.div
                    className="w-full h-full flex items-center justify-center p-4"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1.05, opacity: 1, y: 3 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
                    onClick={(e) => e.stopPropagation()} 
                >
                <div className="w-3/4 h-3/4 max-w-[600px] sm:max-w-[700px] md:max-w-[800px] min-h-[400px] max-h-[90vh] bg-white rounded-lg p-4 sm:p-6 shadow-2xl overflow-auto">
                    
                        <div className="flex justify-between mb-4 items-center">
                            <div className="w-6 h-6"></div>
                            <div className="flex flex-row justify-center items-center">
                                <h1 className="text-2xl font-bold text-black p-3 m-3">Rejestracja</h1>
                            </div>
                            
                            <a
                            href="/"
                            onClick={handleRegisterCloseClick}
                            className="text-2xl font-bold text-gray-600 hover:text-black transition-colors cursor-pointer no-underline"
                            >
                            <X className="w-6 h-6 text-blue-600"/>
                            </a>
                            
                        </div>
                        <div className="flex flex-col items-center justify-center text-black w-full">
                            
                            <div className="flex flex-col items-center justify-center w-full sm:w-2/3 p-4 sm:p-6 md:p-10 gap-4">
                                <input type="text" placeholder="Email" className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="password" placeholder="Hasło" className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <div className="flex flex-row items-center justify-center flex-wrap text-sm sm:text-base">
                                    Masz już konto? <button onClick={handleRegisterCloseClick} className="text-black hover:text-blue-800 transition-colors cursor-pointer underline p-1 gap-1">Zaloguj się</button>    
                                </div>
                            </div>
                            
                            
                            <button className="text-lg sm:text-xl font-bold/90 w-full sm:w-2/3 h-10 bg-sky-400 text-white rounded-xl hover:bg-sky-600 transition-all duration-300 cursor-pointer mt-4">Zarejestruj się</button>
                        </div>

                </div>
                </motion.div>
            </motion.div>
            
        )}
        </AnimatePresence>
    )
}