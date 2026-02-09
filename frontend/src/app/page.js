"use client";
import { useState } from "react";

import Main from "@/components/Main";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/LoadingSpinner";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <LoadingSpinner></LoadingSpinner>
  ),
});

export default function Home() {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);

  const [activeField, setActiveField] = useState(null);

  const handleMapClick = (location) => {
    if (activeField === 'start') {
      setStartLocation(location);
    } else if (activeField === 'end') {
      setEndLocation(location);
    }
    // If no field is active, do nothing (prevent accidental inputs)
  };

  return (
    <div className="relative h-screen w-screen bg-[var(--background)] dark:bg-black overflow-hidden">
      {/* mapa */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Map
          onMapClick={handleMapClick}
          startLocation={startLocation}
          endLocation={endLocation}
        />
      </div>
      {/* główna zawartość */}
      <div className="relative z-10 flex h-full w-full overflow-hidden pointer-events-none p-4 sm:p-6">
        <div className="w-full sm:max-w-[400px] md:max-w-[450px] h-full flex flex-col justify-center pointer-events-auto">
          <Main
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            endLocation={endLocation}
            setEndLocation={setEndLocation}
            setActiveField={setActiveField}
          />
        </div>
      </div>
    </div>

  );
}
