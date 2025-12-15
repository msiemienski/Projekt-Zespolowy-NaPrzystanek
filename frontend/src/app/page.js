"use client";

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
  return (
    <div className="relative h-screen w-screen bg-[var(--background)] dark:bg-black overflow-hidden">
      {/* mapa */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Map />
      </div>
      {/* główna zawartość */}
      <div className="relative z-10 flex h-full w-full overflow-auto pointer-events-none">
        <div className="w-full md:w-1/3 h-full p-6 flex flex-col justify-center pointer-events-auto">
          <Main />
        </div>
      </div>
    </div>
    
  );
}
