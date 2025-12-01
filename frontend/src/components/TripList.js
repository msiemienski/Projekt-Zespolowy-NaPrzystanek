"use client";
import { ArrowLeft, Bus, Clock, Train } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_TRIPS = [
    {
        id: 1,
        departure: "14:30",
        arrival: "15:15",
        duration: "45 min",
        lines: ["199", "6"],
        type: "bus",
        price: "4.80 zł",
    },
    {
        id: 2,
        departure: "14:45",
        arrival: "15:25",
        duration: "40 min",
        lines: ["127"],
        type: "bus",
        price: "3.80 zł",
    },
    {
        id: 3,
        departure: "15:00",
        arrival: "15:50",
        duration: "50 min",
        lines: ["SKM"],
        type: "train",
        price: "6.50 zł",
    },
    {
        id: 4,
        departure: "15:15",
        arrival: "16:05",
        duration: "50 min",
        lines: ["162", "T6"],
        type: "mixed",
        price: "4.80 zł",
    },
];

export default function TripList() {
    return (
        <div className="flex flex-col h-full w-full transition-all duration-500" style={{ backgroundColor: 'var(--bg-main)', borderTopColor: 'var(--border-secondary)', borderTopWidth: '1px' }}>
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_TRIPS.map((trip, index) => (
                    <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-2xl p-4 transition-all duration-500 cursor-pointer group"
                        style={{
                            backgroundColor: 'var(--bg-dropdown)',
                            borderColor: 'var(--border-secondary)',
                            borderWidth: '1px',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div className="flex flex-row justify-between items-start mb-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold transition-colors duration-500" style={{ color: 'var(--text-primary)' }}>
                                        {trip.departure}
                                    </span>
                                    <span className="text-sm transition-colors duration-500" style={{ color: 'var(--text-placeholder)' }}>➔</span>
                                    <span className="text-xl font-semibold transition-colors duration-500" style={{ color: 'var(--text-primary)' }}>
                                        {trip.arrival}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm mt-1 transition-colors duration-500" style={{ color: 'var(--text-placeholder)' }}>
                                    <Clock className="w-3 h-3 transition-colors duration-500" style={{ color: 'var(--text-placeholder)' }} />
                                    <span>{trip.duration}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold px-2 py-1 rounded-lg text-sm transition-colors duration-500" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
                                    {trip.price}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-2 mt-2 pt-3 transition-colors duration-500" style={{ borderTopColor: 'var(--border-secondary)', borderTopWidth: '1px' }}>
                            {trip.lines.map((line, i) => (
                                <span
                                    key={i}
                                    className="flex items-center justify-center px-2 py-1 rounded text-xs font-bold transition-colors duration-500"
                                    style={line === "SKM"
                                        ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04' }
                                        : { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#dc2626' }
                                    }
                                >
                                    {line === "SKM" ? <Train className="w-3 h-3 mr-1 transition-colors duration-500" /> : <Bus className="w-3 h-3 mr-1 transition-colors duration-500" />}
                                    {line}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
