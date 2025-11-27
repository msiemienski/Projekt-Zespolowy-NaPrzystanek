"use client";
import {
  Settings,
  User,
  BusFront,
  Building2,
  ChevronsUpDown,
  LocateIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DatePick from "./DatePick";
import SettingsComp from "./SettingsComp";
import LoginComp from "./LoginComp";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

import { useState } from "react";
import DatePick from "./DatePick";
import SettingsComp from "./SettingsComp";
import LoginComp from "./LoginComp";
import RoutesList from "./RoutesList";
export default function Main() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Gdańsk");
  const [focusedInput, setFocusedInput] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // stan zalogowanego użytkownika
  const [currentUser, setCurrentUser] = useState(null);

  const [showRoutes, setShowRoutes] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSelectChange = (option) => {
    setSelected(option);
    setOpen(false);
  };

  // przy starcie komponentu sprawdzamy, czy mamy zalogowanego użytkownika
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        setCurrentUser(null);
      }
    }

    fetchMe();
  }, []);

  // wylogowanie
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // błąd można zignorować, ważne, że czyścimy stan po stronie frontu
    }
    setCurrentUser(null);
  };

  return (
    <div className="bg-white w-auto h-auto min-w-196 min-h-196 max-w-2xl max-h-[800px] m-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-102 relative">
      <div className="flex flex-row items-center justify-between h-1/12 p-2 border-b border-gray-100 bg-sky-500/3">
        {/* lewa część: logowanie / wylogowanie */}
        {!currentUser && (
          <>
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer"
            >
              <User className="w-10 h-10 text-blue-600" />
            </button>
            <LoginComp
              onClose={() => setShowLogin(false)}
              showLogin={showLogin}
            />
          </>
        )}

        {currentUser && (
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-xl border border-blue-600 text-blue-600 text-sm hover:bg-blue-50 transition"
            >
              Wyloguj
            </button>
            <span className="text-sm font-medium text-blue-800">
              {currentUser.name || currentUser.email}
            </span>
          </div>
        )}

        {/* środek: tytuł i ikona autobusu */}
  const handleSearchRoutes = async () => {
    setShowRoutes(true);
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call when backend is ready
      // Example API call structure:
      // const response = await fetch('/api/routes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ from, to, date, city: selected })
      // });
      // if (!response.ok) throw new Error('Failed to fetch routes');
      // const data = await response.json();
      // setRoutes(data);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, set routes to null to show mock data in RoutesList
      setRoutes(null);
    } catch (err) {
      setError(
        err.message ||
          "Wystąpił błąd podczas wyszukiwania tras. Spróbuj ponownie."
      );
      setRoutes(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleSearchRoutes();
  };
  return (
    <div className="bg-white w-full max-w-[500px] h-[90vh] max-h-[800px] m-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 relative flex flex-col overflow-hidden">
      <div className="flex flex-row items-center justify-between p-3 border-b border-gray-100 bg-sky-500/3 shrink-0">
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer"
        >
          <User className="w-10 h-10 text-blue-600" />
        </button>
        <LoginComp
          onClose={() => setShowLogin(false)}
          showLogin={showLogin}
        ></LoginComp>
        <div className="flex flex-row items-center justify-between gap-2">
          <h1
            className="font-bold text-2xl select-none"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Na Przystanek
          </h1>
          <BusFront />
        </div>

        {/* prawa część: ustawienia */}
          <BusFront></BusFront>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer"
        >
          <Settings className="w-10 h-10 text-blue-600" />
        </button>
      </div>
      <div className="flex flex-row justify-start items-center h-1/12 gap-20 pl-5 text-blue-600 bg-blue-500/4">
        <SettingsComp
          onClose={() => setShowSettings(false)}
          showSettings={showSettings}
        ></SettingsComp>
      </div>
      <div className="flex flex-row justify-start items-center gap-4 pl-4 py-2 text-blue-600 bg-blue-500/4 shrink-0">
        <div className="flex flex-row items-center justify-center gap-2 relative">
          <button
            value={selected}
            onChange={handleSelectChange}
            onClick={() => setOpen(!open)}
            className="cursor-pointer hover:opacity-70 transition"
          >
            <div className="flex flex-row items-center justify-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="font-bold text-l">{selected}</span>
              <ChevronsUpDown />
            </div>
          </button>
          {open && (
            <ul className="absolute z-10 top-full mt-1 ml-10 w-40 bg-white border rounded shadow-lg">
              {["Gdańsk", "Sopot", "Gdynia"].map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleSelectChange(opt)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-start items-center h-1/10 gap-2 pl-5 text-blue-600 bg-blue-500/4">
      <div className="flex flex-row justify-start items-center gap-2 pl-4 py-2 text-blue-600 bg-blue-500/4 shrink-0">
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <div className="relative w-4/5">
            <input
              type="text"
              placeholder="Skąd chcesz jechać?"
              onFocus={() => setFocusedInput(1)}
              onBlur={() => setFocusedInput(null)}
              className={`w-full h-10 font-bold text-xl border rounded-xl p-5 pr-12
                        transition-all duration-300 ease-in-out
                        h-10 px-3 text-base
                        ${focusedInput === 1 ? "h-12 text-lg" : ""}
                        border border-gray-300 rounded
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        `}
            />

            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-blue-500/20 rounded-full">
              <LocateIcon className="w-6 h-6 text-blue-600 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-start items-center h-1/10 gap-2 pl-5 text-blue-600 bg-blue-500/4">
        <div className="flex flex-row items-center justify-center gap-2 w-full">
      <div className="flex flex-row justify-center items-center gap-2 pl-4 py-2 text-blue-600 bg-blue-500/4 shrink-0">
        <div className="flex flex-row items-center justify-center gap-2 w-4/5">
          <input
            type="text"
            placeholder="Dokąd chcesz jechać?"
            onFocus={() => setFocusedInput(2)}
            onBlur={() => setFocusedInput(null)}
            className={`w-4/5 h-10 font-bold text-xl border rounded-xl p-5 pr-12
            className={`w-full h-10 font-bold text-xl border rounded-xl p-5 pr-12
                        transition-all duration-300 ease-in-out
                        h-10 px-3 text-base
                        ${focusedInput === 2 ? "h-12 text-lg" : ""}
                        border border-gray-300 rounded
                        focus:outline-none focus:ring-2 focus:ring-blue-400
                        `}
          />
        </div>
      </div>
      <div className="flex flex-row justify-between items-center h-1/10 p-10 text-blue-600 bg-blue-500/4">
        <DatePick></DatePick>
      </div>
      <div className="flex flex-row justify-center items-center h-1/10 p-10 bg-blue-500/4">
        <motion.button
      <div className="flex flex-row justify-between items-center p-4 text-blue-600 bg-blue-500/4 shrink-0">
        <DatePick></DatePick>
      </div>
      <div className="flex flex-row justify-center items-center p-4 bg-blue-500/4 shrink-0">
        <motion.button
          onClick={handleSearchRoutes}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-lg sm:text-xl font-bold/90 w-full sm:w-1/3 h-10 bg-red-400/90 text-white rounded-xl hover:bg-red-400 cursor-pointer mt-4 shadow-lg"
        >
          Wyszukaj trasy
        </motion.button>
      </div>
    </div>
  );
}
      {showRoutes && (
        <div className="border-t border-gray-200 bg-gray-50 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <RoutesList
            routes={routes}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
