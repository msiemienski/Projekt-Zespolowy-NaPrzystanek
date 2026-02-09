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
import AddressSearch from "./AddressSearch";
import SettingsComp from "./SettingsComp";
import LoginComp from "./LoginComp";
import AdminPanelComp from "./AdminPanelComp"; // Import panelu administratora
import TripList from "./TripList";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function Main({
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  setActiveField,
  selectedTrip,
  setSelectedTrip
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Gdańsk");
  const [focusedInput, setFocusedInput] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Stan widoczności panelu admina

  // stan zalogowanego użytkownika
  const [currentUser, setCurrentUser] = useState(null);

  // stan wybranej daty
  const [selectedDate, setSelectedDate] = useState(new Date());

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
        } else if (res.status === 401) {
          setCurrentUser(null);
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
  // internal 'from' and 'to' state removed in favor of props

  const handleSearch = () => {
    if (!startLocation || !endLocation) {
      alert("Wybierz zarówno punkt startowy, jak i docelowy.");
      return;
    }
    console.log("Szukaj trasy od:", startLocation, "do:", endLocation);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
  };

  return (
    <div
      ref={mainContainerRef}
      className="w-full h-full max-h-full rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 relative flex flex-col overflow-auto"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div className="flex flex-row items-center justify-between p-3 sm:p-4 border-b shrink-0 relative overflow-hidden" style={{ borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-header)' }}>
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
          <div className="flex flex-col items-start gap-1 min-w-0 flex-shrink-0 z-10 pr-2" style={{ maxWidth: '40%' }}>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-2 py-1 mb-1 rounded-xl border text-xs font-bold transition whitespace-nowrap flex-shrink-0"
                style={{
                  borderColor: 'red',
                  color: 'red',
                  backgroundColor: 'rgba(255,0,0,0.1)'
                }}
              >
                Panel Admina
              </button>
            )}
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
      <div className="flex flex-row justify-start items-center py-3 px-5 shrink-0 overflow-visible" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
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
      <div className="flex flex-row justify-start items-center py-2 px-5 shrink-0 overflow-visible" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <div className="relative w-full sm:w-4/5">
            <AddressSearch
              selectedLocation={startLocation}
              onSelect={(loc) => setStartLocation(loc)}
              inputProps={{
                className: `w-full h-10 font-bold text-base sm:text-base border rounded-xl p-3 sm:p-5 pr-12
                        transition-all duration-300 ease-in-out
                        h-10 px-3
                        ${focusedInput === 1 ? "h-12 text-lg" : ""}
                        rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500`,
                style: {
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)'
                },
                placeholder: 'Skąd chcesz jechać?',
                onFocus: (e) => {
                  console.log('🎯 START field focused');
                  e.target.style.borderColor = '#60a5fa';
                  setFocusedInput(1);
                  setActiveField('start');
                },
                onBlur: (e) => {
                  console.log('⚠️ START field blurred (activeField should stay active)');
                  e.target.style.borderColor = 'var(--border-primary)';
                  setFocusedInput(null);
                }
              }}
            />

            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--icon-primary)' }}>
              <LocateIcon className="w-5 h-5 sm:w-6 h-6 cursor-pointer" style={{ color: 'var(--icon-primary)' }} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-start items-center py-2 px-5 shrink-0 overflow-visible" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <div className="relative w-full sm:w-4/5">
            <AddressSearch
              selectedLocation={endLocation}
              onSelect={(loc) => setEndLocation(loc)}
              selectedDate={selectedDate}
              inputProps={{
                className: `w-full h-10 font-bold text-base sm:text-medium border rounded-xl p-3 sm:p-5
                        transition-all duration-300 ease-in-out
                        h-10 px-3
                        ${focusedInput === 2 ? "h-12 text-lg" : ""}
                        rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500`,
                style: {
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  '--placeholder-color': 'var(--text-placeholder)'
                },
                placeholder: 'Dokąd chcesz jechać?',
                onFocus: (e) => {
                  console.log('🎯 END field focused');
                  e.target.style.borderColor = '#60a5fa';
                  setFocusedInput(2);
                  setActiveField('end');
                },
                onBlur: (e) => {
                  console.log('⚠️ END field blurred (activeField should stay active)');
                  e.target.style.borderColor = 'var(--border-primary)';
                  setFocusedInput(null);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center items-center py-4 px-5 shrink-0" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-section)' }}>
        <div className="w-full sm:w-4/5">
          <DatePick onDateChange={setSelectedDate}></DatePick>
        </div>
      </div>
      <div className="flex flex-row justify-center items-center py-6 px-5 shrink-0" style={{ backgroundColor: 'var(--bg-section)' }}>
        <motion.button
          id="search-button"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(248, 113, 113, 1)", // bg-red-400
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={handleSearch}
          className="text-lg font-bold w-full sm:w-auto px-8 py-3 bg-red-400/90 text-white rounded-xl shadow-lg whitespace-nowrap"
        >
          Wyszukaj trasy
        </motion.button>
      </div>

      {showResults && (
        <div className="flex-1 overflow-hidden w-full relative animate-in slide-in-from-bottom-10 fade-in duration-500">
          <TripList
            from={startLocation}
            to={endLocation}
            date={selectedDate}
            onTripSelect={setSelectedTrip}
            currentUser={currentUser}
          />
        </div>
      )}

      <LoginComp
        onClose={() => setShowLogin(false)}
        showLogin={showLogin}
      />

      <SettingsComp
        onClose={() => setShowSettings(false)}
        showSettings={showSettings}
        currentUser={currentUser} // Przekazujemy dane zalogowanego użytkownika
        setCurrentUser={setCurrentUser} // Przekazujemy funkcję do aktualizacji stanu
      />

      <AdminPanelComp
        onClose={() => setShowAdminPanel(false)}
        showAdminPanel={showAdminPanel}
      />
    </div>
  );
}
