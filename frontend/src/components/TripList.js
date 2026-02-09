"use client";
import { ArrowLeft, Bus, Clock, Train } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TripList({ from, to, date, onTripSelect }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!from || !to) {
      setTrips([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Wyszukiwanie tras przez OTP GraphQL API
    // Używamy daty z DatePick lub domyślnie "teraz"
    const searchDate = date || new Date();
    const dateStr = searchDate.toISOString().split('T')[0];
    const timeStr = searchDate.toTimeString().slice(0, 5);

    const query = `
      query {
        plan(
          fromPlace: "${from.lat},${from.lon}"
          toPlace: "${to.lat},${to.lon}"
          numItineraries: 5
          date: "${dateStr}"
          time: "${timeStr}"
        ) {
          itineraries {
            duration
            startTime
            endTime
            legs {
              mode
              distance
              legGeometry {
                points
              }
              route {
                shortName
                longName
              }
              from {
                name
                lat
                lon
              }
              to {
                name
                lat
                lon
              }
              startTime
              endTime
            }
          }
        }
      }
    `;

    // OTP GraphQL API endpoint
    const OTP_API_URL = "http://localhost:8080/otp/gtfs/v1";

    fetch(OTP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          throw new Error(data.errors[0]?.message || "Błąd wyszukiwania tras");
        }

        const itineraries = data?.data?.plan?.itineraries || [];

        const formattedTrips = itineraries.map((itinerary, idx) => {
          // Obliczanie czasu trwania
          const durationMs = itinerary.duration * 1000;
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          const durationStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;

          // Formatowanie czasu
          const formatTime = (timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
          };

          // Zbieranie linii z legów wraz z ich trybami
          const linesMap = new Map(); // Map<shortName, mode>
          const modes = new Set();

          itinerary.legs.forEach((leg) => {
            if (leg.route?.shortName) {
              const shortName = leg.route.shortName;
              const mode = leg.mode || "BUS";
              // Zapamiętaj tryb dla tej linii (jeśli linia już istnieje, zachowaj pierwszy tryb)
              if (!linesMap.has(shortName)) {
                linesMap.set(shortName, mode);
              }
            }
            if (leg.mode) {
              modes.add(leg.mode);
            }
          });

          // Konwersja Map na tablicę obiektów {name, mode}
          const lines = Array.from(linesMap.entries()).map(([name, mode]) => ({
            name,
            mode
          }));

          // Określenie typu
          let type = "bus";
          if (modes.has("RAIL") || modes.has("SUBWAY")) {
            type = "train";
          } else if (modes.has("TRAM")) {
            type = "tram";
          } else if (modes.size > 1) {
            type = "mixed";
          }

          // Determine if this is a walking-only trip
          const isWalkOnly = itinerary.legs.every(leg => leg.mode === 'WALK');

          return {
            id: idx + 1,
            departure: formatTime(itinerary.startTime),
            arrival: formatTime(itinerary.endTime),
            duration: durationStr,
            durationSeconds: itinerary.duration, // Keep raw duration for sorting
            lines: lines,
            type: isWalkOnly ? 'walk' : type,
            price: "4.80 zł", // OTP nie zwraca ceny, można dodać później
            rawItinerary: itinerary, // Store for route visualization
            isWalkOnly: isWalkOnly,
          };
        });

        // Sort trips: transit first, then by duration
        formattedTrips.sort((a, b) => {
          // Walking trips go last
          if (a.isWalkOnly && !b.isWalkOnly) return 1;
          if (!a.isWalkOnly && b.isWalkOnly) return -1;

          // Otherwise sort by duration
          return a.durationSeconds - b.durationSeconds;
        });

        setTrips(formattedTrips);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd wyszukiwania tras:", err);
        setError(err.message || "Nie udało się znaleźć tras. Upewnij się, że OTP działa na localhost:8080");
        setLoading(false);
      });
  }, [from, to, date]);
  return (
    <div className="flex flex-col h-full w-full transition-all duration-500" style={{ backgroundColor: 'var(--bg-main)', borderTopColor: 'var(--border-secondary)', borderTopWidth: '1px' }}>
      {/* Summary (from/to) */}
      {(from || to) && (
        <div className="p-3">
          <div className="text-sm text-slate-500">Trasa</div>
          <div className="font-semibold">
            {from ? from.label : "-"} ➔ {to ? to.label : "-"}
          </div>
        </div>
      )}
      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
              Wyszukiwanie tras...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-8">
            <div className="text-sm text-red-500">
              {error}
            </div>
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm" style={{ color: 'var(--text-placeholder)' }}>
              Nie znaleziono tras
            </div>
          </div>
        )}
        {trips.map((trip, index) => (
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
            onClick={() => onTripSelect?.(trip)}
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
                  <span className="text-xl sm:text-2xl font-bold transition-colors duration-500" style={{ color: 'var(--text-primary)' }}>
                    {trip.departure}
                  </span>
                  <span className="text-sm transition-colors duration-500" style={{ color: 'var(--text-placeholder)' }}>➔</span>
                  <span className="text-lg sm:text-xl font-semibold transition-colors duration-500" style={{ color: 'var(--text-primary)' }}>
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
              {trip.lines.map((line, i) => {
                const lineName = typeof line === 'string' ? line : line.name;
                const lineMode = typeof line === 'object' ? line.mode : null;

                const isSKM = lineName === "SKM";

                let IconComponent = Bus;
                let bgColor = 'rgba(239, 68, 68, 0.2)';
                let textColor = '#dc2626';

                if (isSKM || lineMode === "RAIL" || lineMode === "SUBWAY") {
                  IconComponent = Train;
                  bgColor = 'rgba(234, 179, 8, 0.2)';
                  textColor = '#ca8a04';
                } else if (lineMode === "TRAM") {
                  IconComponent = Train;
                  bgColor = 'rgba(59, 130, 246, 0.2)';
                  textColor = '#2563eb';
                }

                return (
                  <span
                    key={i}
                    className="flex items-center justify-center px-2 py-1 rounded text-xs font-bold transition-colors duration-500"
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    <IconComponent className="w-3 h-3 mr-1 transition-colors duration-500" />
                    {lineName}
                  </span>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
