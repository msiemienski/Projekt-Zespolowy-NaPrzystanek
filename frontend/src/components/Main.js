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
import { useState, useEffect, useRef } from "react";
import DatePick from "./DatePick";
import SettingsComp from "./SettingsComp";
import LoginComp from "./LoginComp";
import TripList from "./TripList";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function Main() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Gdańsk");
  const [focusedInput, setFocusedInput] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // stan zalogowanego użytkownika
  const [currentUser, setCurrentUser] = useState(null);

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

  // Ref do głównego kontenera
  const mainContainerRef = useRef(null);

  // Blokowanie scrollbara gdy modale są otwarte
  useEffect(() => {
    if (showLogin || showSettings) {
      // Zapisz szerokość scrollbara przed zablokowaniem
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Zablokuj scroll na body
      document.body.style.overflow = "hidden";
      
      // Zablokuj scroll na głównym kontenerze Main
      if (mainContainerRef.current) {
        mainContainerRef.current.style.overflow = "hidden";
      }
      
      // Dodaj padding, żeby zrekompensować szerokość scrollbara
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // Przywróć normalny scroll
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      
      // Przywróć overflow na głównym kontenerze
      if (mainContainerRef.current) {
        mainContainerRef.current.style.overflow = "auto";
      }
    }

    // Cleanup przy unmount
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (mainContainerRef.current) {
        mainContainerRef.current.style.overflow = "auto";
      }
    };
  }, [showLogin, showSettings]);

  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <div 
      ref={mainContainerRef}
      className="w-full h-full max-h-full rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] relative flex flex-col overflow-auto"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div className="flex flex-row items-center justify-between min-h-[8.333%] p-1 sm:p-2 border-b shrink-0 relative overflow-hidden" style={{ borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-header)' }}>
        {/* lewa część: logowanie / wylogowanie */}
        {!currentUser && (
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer flex-shrink-0 z-10"
          >
            <User className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--icon-primary)' }} />
          </button>
        )}

        {currentUser && (
          <div className="flex flex-col items-start gap-1 min-w-0 flex-shrink-0 z-10 pr-2" style={{ maxWidth: 'calc(50% - 60px)' }}>
            <button
              onClick={handleLogout}
              className="px-2 py-1 rounded-xl border text-xs transition whitespace-nowrap flex-shrink-0"
              style={{ 
                borderColor: 'var(--border-primary)', 
                color: 'var(--text-primary)', 
                backgroundColor: 'var(--bg-button)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
            >
              Wyloguj
            </button>
            <span className="text-[10px] font-medium hidden md:block truncate max-w-[120px] min-w-0" style={{ color: 'var(--text-secondary)' }}>
              {currentUser.email}
            </span>
          </div>
        )}

        {/* środek: tytuł i ikona autobusu */}
        <div className="flex flex-row items-center justify-between gap-1 sm:gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <h1
            className="font-bold text-xl lg:text-2xl select-none hidden xl:block whitespace-nowrap"
            style={{ fontFamily: "var(--font-poppins)", color: 'var(--text-primary)' }}
          >
            Na Przystanek
          </h1>
          <BusFront className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--icon-primary)' }} />
        </div>

        {/* prawa część: ustawienia */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-0 w-fit h-fit hover:opacity-70 transition cursor-pointer flex-shrink-0 z-10"
        >
          <Settings className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--icon-primary)' }} />
        </button>
      </div>
      <div className="flex flex-row justify-start items-center min-h-[8.333%] gap-4 sm:gap-20 pl-5 shrink-0 overflow-visible" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="flex flex-row items-center justify-center gap-2 relative">
          <button
            value={selected}
            onChange={handleSelectChange}
            onClick={() => setOpen(!open)}
            className="cursor-pointer hover:opacity-70 transition"
          >
            <div className="flex flex-row items-center justify-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: 'var(--icon-primary)' }} />
              <span className="font-bold text-l" style={{ color: 'var(--text-primary)' }}>{selected}</span>
              <ChevronsUpDown style={{ color: 'var(--icon-primary)' }} />
            </div>
          </button>
          {open && (
            <ul className="absolute z-10 top-full mt-1 ml-10 w-40 border rounded shadow-lg" style={{ backgroundColor: 'var(--bg-dropdown)', borderColor: 'var(--border-primary)' }}>
              {["Gdańsk", "Sopot", "Gdynia"].map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleSelectChange(opt)}
                  className="p-2 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dropdown-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dropdown)'}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-start items-center min-h-[10%] gap-2 pl-5 shrink-0 overflow-auto" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <div className="relative w-4/5">
            <input
              type="text"
              placeholder="Skąd chcesz jechać?"
              className={`w-full h-10 font-bold text-base sm:text-xl border rounded-xl p-3 sm:p-5 pr-12
                        transition-all duration-300 ease-in-out
                        h-10 px-3
                        ${focusedInput === 1 ? "h-12 text-lg" : ""}
                        rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                        `}
              style={{
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                setFocusedInput(1);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                setFocusedInput(null);
              }}
            />

            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full" style={{ color: 'var(--icon-primary)' }}>
              <LocateIcon className="w-6 h-6 cursor-pointer" style={{ color: 'var(--icon-primary)' }} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-start items-center min-h-[10%] gap-2 pl-5 shrink-0 overflow-auto" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <input
            type="text"
            placeholder="Dokąd chcesz jechać?"
            className={`w-4/5 h-10 font-bold text-base sm:text-xl border rounded-xl p-3 sm:p-5 pr-12
                        transition-all duration-300 ease-in-out
                        h-10 px-3
                        ${focusedInput === 2 ? "h-12 text-lg" : ""}
                        rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500
                        `}
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              '--placeholder-color': 'var(--text-placeholder)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#60a5fa';
              setFocusedInput(2);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-primary)';
              setFocusedInput(null);
            }}
          />
        </div>
      </div>
      <div className="flex flex-row justify-between items-center min-h-[10%] p-10 shrink-0" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <DatePick></DatePick>
      </div>
      <div className="flex flex-row justify-center items-center min-h-[10%] p-10 shrink-0" style={{ backgroundColor: 'var(--bg-section)' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={handleSearch}
          className="text-lg font-bold/90 w-auto px-8 py-2 bg-red-400/90 text-white rounded-xl hover:bg-red-400 cursor-pointer mt-4 shadow-lg whitespace-nowrap"
        >
          Wyszukaj trasy
        </motion.button>
      </div>

      {showResults && (
        <div className="flex-1 overflow-hidden w-full relative animate-in slide-in-from-bottom-10 fade-in duration-500">
          <TripList />
        </div>
      )}

      <LoginComp
        onClose={() => setShowLogin(false)}
        showLogin={showLogin}
      />

      <SettingsComp
        onClose={() => setShowSettings(false)}
        showSettings={showSettings}
      />
    </div>
  );
}
