"use client";
import { Bus, Clock, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

export default function RoutesList({
  routes = null,
  isLoading = false,
  error = null,
  onRetry = null,
}) {
  // Mock data structure - replace with actual data when available
  const mockRoutes = [
    {
      id: 1,
      routeNumber: "100",
      routeType: "bus",
      from: "Gdańsk Główny",
      to: "Sopot Kamienny Potok",
      duration: "45 min",
      departureTime: "14:30",
      arrivalTime: "15:15",
      stops: 12,
      price: "4.50 zł",
      transfers: 0,
    },
    {
      id: 2,
      routeNumber: "SKM",
      routeType: "train",
      from: "Gdańsk Główny",
      to: "Sopot Kamienny Potok",
      duration: "25 min",
      departureTime: "14:45",
      arrivalTime: "15:10",
      stops: 3,
      price: "5.20 zł",
      transfers: 0,
    },
    {
      id: 3,
      routeNumber: "122",
      routeType: "bus",
      from: "Gdańsk Główny",
      to: "Sopot Kamienny Potok",
      duration: "55 min",
      departureTime: "14:20",
      arrivalTime: "15:15",
      stops: 18,
      price: "4.50 zł",
      transfers: 1,
      transferAt: "Gdańsk Wrzeszcz",
    },
    {
      id: 4,
      routeNumber: "Tram 6",
      routeType: "tram",
      from: "Gdańsk Główny",
      to: "Sopot Kamienny Potok",
      duration: "50 min",
      departureTime: "14:35",
      arrivalTime: "15:25",
      stops: 15,
      price: "4.50 zł",
      transfers: 0,
    },
  ];

  const routesToDisplay = routes || mockRoutes;

  const getRouteTypeIcon = (type) => {
    return <Bus className="w-5 h-5" />;
  };

  const getRouteTypeColor = (type) => {
    switch (type) {
      case "bus":
        return "bg-blue-500";
      case "train":
        return "bg-green-500";
      case "tram":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Wyszukiwanie tras..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Nie udało się pobrać tras"
        details={error}
        onRetry={onRetry}
      />
    );
  }

  if (!routesToDisplay || routesToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 font-semibold text-lg">
          Nie znaleziono tras
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Spróbuj zmienić kryteria wyszukiwania
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-3 overflow-x-hidden">
      <div className="mb-4">
        <h2
          className="text-xl font-bold text-blue-600"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Znalezione trasy ({routesToDisplay.length})
        </h2>
      </div>
      <div className="space-y-3">
        {routesToDisplay.map((route, index) => (
          <motion.div
            key={route.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-row items-start justify-between gap-2 sm:gap-4 min-w-0">
              {/* Left side - Route info */}
              <div className="flex flex-row items-start gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Route number badge */}
                <div
                  className={`${getRouteTypeColor(
                    route.routeType
                  )} text-white rounded-lg px-3 py-2 flex items-center justify-center min-w-[60px]`}
                >
                  <div className="flex flex-col items-center">
                    {getRouteTypeIcon(route.routeType)}
                    <span className="text-xs font-bold mt-1">
                      {route.routeNumber}
                    </span>
                  </div>
                </div>

                {/* Route details */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {route.from}
                      </span>
                    </div>
                    <div className="flex flex-row items-center gap-2 ml-6">
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="flex flex-row items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {route.to}
                      </span>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="flex flex-row items-center gap-2 sm:gap-4 text-xs text-gray-600 flex-wrap">
                    <div className="flex flex-row items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{route.duration}</span>
                    </div>
                    <span>•</span>
                    <span>{route.stops} przystanków</span>
                    {route.transfers > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600 font-semibold">
                          {route.transfers} przesiadka
                          {route.transfers > 1 ? "i" : ""}
                          {route.transferAt && ` w ${route.transferAt}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Time and price */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-blue-600">
                    {route.departureTime}
                  </span>
                  <span className="text-xs text-gray-500">odjazd</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-green-600">
                    {route.arrivalTime}
                  </span>
                  <span className="text-xs text-gray-500">przyjazd</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">
                    {route.price}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
