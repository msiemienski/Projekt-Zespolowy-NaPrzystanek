"use client";
import { ArrowLeft, Bus, Clock, Train } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TripList({ from, to, date }) {
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

    // OTP GraphQL API endpoint - próbujemy oba możliwe endpointy
    const endpoints = [
      "http://localhost:8080/otp/routers/default/gtfs/v1",
      "http://localhost:8080/otp/gtfs/v1"
    ];

    // Próbujemy pierwszy endpoint
    fetch(endpoints[0], {
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

          // Zbieranie linii z legów
          const lines = [];
          const modes = new Set();
          
          itinerary.legs.forEach((leg) => {
            if (leg.route?.shortName) {
              lines.push(leg.route.shortName);
            }
            if (leg.mode) {
              modes.add(leg.mode);
            }
          });

          // Określenie typu
          let type = "bus";
          if (modes.has("RAIL") || modes.has("SUBWAY")) {
            type = "train";
          } else if (modes.size > 1) {
            type = "mixed";
          }

          return {
            id: idx + 1,
            departure: formatTime(itinerary.startTime),
            arrival: formatTime(itinerary.endTime),
            duration: durationStr,
            lines: [...new Set(lines)], // Usuwamy duplikaty
            type: type,
            price: "4.80 zł", // OTP nie zwraca ceny, można dodać później
          };
        });

        setTrips(formattedTrips);
        setLoading(false);
      })
      .catch((err) => {
        // Jeśli pierwszy endpoint nie działa, próbujemy drugi
        console.log("Próba alternatywnego endpointu...");
        return fetch(endpoints[1], {
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

              // Zbieranie linii z legów
              const lines = [];
              const modes = new Set();
              
              itinerary.legs.forEach((leg) => {
                if (leg.route?.shortName) {
                  lines.push(leg.route.shortName);
                }
                if (leg.mode) {
                  modes.add(leg.mode);
                }
              });

              // Określenie typu
              let type = "bus";
              if (modes.has("RAIL") || modes.has("SUBWAY")) {
                type = "train";
              } else if (modes.size > 1) {
                type = "mixed";
              }

              return {
                id: idx + 1,
                departure: formatTime(itinerary.startTime),
                arrival: formatTime(itinerary.endTime),
                duration: durationStr,
                lines: [...new Set(lines)], // Usuwamy duplikaty
                type: type,
                price: "4.80 zł", // OTP nie zwraca ceny, można dodać później
              };
            });

            setTrips(formattedTrips);
            setLoading(false);
          });
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
