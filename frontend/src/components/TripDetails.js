"use client";
import { X, MapPin, Bus, Train, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function TripDetails({ trip, onClose }) {
    if (!trip || !trip.rawItinerary) return null;

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    };

    const formatDistance = (meters) => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const getModeIcon = (mode) => {
        switch (mode) {
            case 'BUS':
                return <Bus className="w-4 h-4" />;
            case 'TRAM':
            case 'RAIL':
            case 'SUBWAY':
                return <Train className="w-4 h-4" />;
            case 'WALK':
                return <Navigation className="w-4 h-4" />;
            default:
                return <MapPin className="w-4 h-4" />;
        }
    };

    const getModeLabel = (mode, route) => {
        if (mode === 'WALK') return 'Idź pieszo';
        if (route?.shortName) return `Linia ${route.shortName}`;
        return mode;
    };

    const getModeColor = (mode) => {
        switch (mode) {
            case 'BUS':
                return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', border: '#ef4444' };
            case 'TRAM':
                return { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', border: '#3b82f6' };
            case 'RAIL':
            case 'SUBWAY':
                return { bg: 'rgba(234, 179, 8, 0.1)', text: '#ca8a04', border: '#eab308' };
            case 'WALK':
                return { bg: 'rgba(156, 163, 175, 0.1)', text: '#6b7280', border: '#9ca3af' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', text: '#4b5563', border: '#6b7280' };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-main)',
                maxHeight: '60vh',
                zIndex: 50
            }}
        >
            {/* Header */}
            <div className="sticky top-0 p-4 border-b flex justify-between items-center" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-secondary)' }}>
                <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Szczegóły trasy</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {trip.departure} - {trip.arrival} • {trip.duration}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <X className="w-6 h-6" style={{ color: 'var(--icon-primary)' }} />
                </button>
            </div>

            {/* Trip legs */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(60vh - 80px)' }}>
                {trip.rawItinerary.legs.map((leg, idx) => {
                    const colors = getModeColor(leg.mode);
                    const duration = ((leg.endTime - leg.startTime) / 1000 / 60).toFixed(0);

                    return (
                        <div
                            key={idx}
                            className="rounded-xl p-4 border"
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                            }}
                        >
                            {/* Leg header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: 'white', color: colors.text }}
                                >
                                    {getModeIcon(leg.mode)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold" style={{ color: colors.text }}>
                                        {getModeLabel(leg.mode, leg.route)}
                                    </div>
                                    <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                        <Clock className="w-3 h-3" />
                                        {duration} min
                                        {leg.distance && ` • ${formatDistance(leg.distance)}`}
                                    </div>
                                </div>
                            </div>

                            {/* From/To locations */}
                            <div className="space-y-2 ml-10">
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colors.border }}></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {leg.from.name}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {formatTime(leg.startTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-l-2 h-6 ml-1.5" style={{ borderColor: colors.border, opacity: 0.3 }}></div>

                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colors.border }}></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {leg.to.name}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {formatTime(leg.endTime)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer summary */}
            <div className="sticky bottom-0 p-4 border-t" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-secondary)' }}>
                <div className="flex justify-between items-center">
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{trip.rawItinerary.legs.length}</strong> {trip.rawItinerary.legs.length === 1 ? 'etap' : 'etapy'}
                    </div>
                    <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {trip.price}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
