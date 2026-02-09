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
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-main)',
                width: '380px',
                maxWidth: '90vw',
                height: 'calc(100vh - 3rem)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-start" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-secondary)' }}>
                <div className="flex-1 pr-2">
                    <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Szczegóły trasy</h3>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span>{trip.departure}</span>
                        <span>→</span>
                        <span>{trip.arrival}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <Clock className="w-3 h-3" />
                            <span>{trip.duration}</span>
                        </div>
                        <div className="font-bold text-xs px-2 py-1 rounded" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
                            {trip.price}
                        </div>
                        {trip.basePrice > 0 && trip.price !== `${trip.basePrice.toFixed(2)} zł` && (
                            <div className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                                Zastosowano ulgę
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
                    title="Zamknij szczegóły (wybierz inną trasę)"
                >
                    <X className="w-5 h-5" style={{ color: 'var(--icon-primary)' }} />
                </button>
            </div>

            {/* Trip legs */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {trip.rawItinerary.legs.map((leg, idx) => {
                    const colors = getModeColor(leg.mode);
                    const duration = ((leg.endTime - leg.startTime) / 1000 / 60).toFixed(0);

                    return (
                        <div
                            key={idx}
                            className="rounded-xl p-3 border"
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                            }}
                        >
                            {/* Leg header */}
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="p-1.5 rounded-lg"
                                    style={{ backgroundColor: 'white', color: colors.text }}
                                >
                                    {getModeIcon(leg.mode)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate" style={{ color: colors.text }}>
                                        {getModeLabel(leg.mode, leg.route)}
                                    </div>
                                    <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        <Clock className="w-3 h-3" />
                                        {duration} min
                                        {leg.distance && ` • ${formatDistance(leg.distance)}`}
                                    </div>
                                </div>
                            </div>

                            {/* From/To locations */}
                            <div className="space-y-1.5 ml-9">
                                <div className="flex items-start gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colors.border }}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {leg.from.name}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {formatTime(leg.startTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-l-2 h-4 ml-1" style={{ borderColor: colors.border, opacity: 0.3 }}></div>

                                <div className="flex items-start gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: colors.border }}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
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
            <div className="p-3 border-t" style={{ backgroundColor: 'var(--bg-section)', borderColor: 'var(--border-secondary)' }}>
                <div className="flex justify-between items-center text-sm">
                    <div style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{trip.rawItinerary.legs.length}</strong> {trip.rawItinerary.legs.length === 1 ? 'etap' : 'etapy'}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {trip.price}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
