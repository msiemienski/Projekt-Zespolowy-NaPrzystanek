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
                    className="absolute top-0 left-0 inset-0 bg-black/50 rounded-lg flex items-center justify-center z-50 h-full w-full text-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.42, 0.97, 0.52, 1.49] }}
                    onClick={onClose}
                >
                <motion.div
                    className="min-w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1.05, opacity: 1, y: 3 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
                    onClick={(e) => e.stopPropagation()} 
                >
                <div className="max-w-[800px] min-h-150 max-h-500 bg-white rounded-lg p-4 shadow-2xl">
                    
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
                        <div className="flex flex-col items-center justify-center text-black">
                            
                            <div className="flex flex-col items-center justify-center w-2/3 h-2/3 p-10 gap-4">
                                <input type="text" placeholder="Email" className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="password" placeholder="Hasło" className="w-full h-10 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <div className="flex flex-row items-center justify-center">
                                    Masz już konto? <button onClick={handleRegisterCloseClick} className="text-black hover:text-blue-800 transition-colors cursor-pointer underline p-1 gap-1">Zaloguj się</button>    
                                </div>
                            </div>
                            
                            
                            <button className="text-xl font-bold/90 w-2/3 h-10 bg-sky-400 text-white rounded-xl hover:bg-sky-600 transition-all duration-300 cursor-pointer">Zarejestruj się</button>
                        </div>

                </div>
                </motion.div>
            </motion.div>
            
        )}
        </AnimatePresence>
    )
}