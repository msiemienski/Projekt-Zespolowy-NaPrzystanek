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
        <div className="flex flex-col h-full w-full bg-white border-t border-gray-100">
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_TRIPS.map((trip, index) => (
                    <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex flex-row justify-between items-start mb-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800">
                                        {trip.departure}
                                    </span>
                                    <span className="text-gray-400 text-sm">➔</span>
                                    <span className="text-xl font-semibold text-gray-600">
                                        {trip.arrival}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{trip.duration}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                                    {trip.price}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-2 mt-2 pt-3 border-t border-gray-50">
                            {trip.lines.map((line, i) => (
                                <span
                                    key={i}
                                    className={`flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${line === "SKM"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {line === "SKM" ? <Train className="w-3 h-3 mr-1" /> : <Bus className="w-3 h-3 mr-1" />}
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
