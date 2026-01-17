"use client";
import React, { useState, useEffect, useRef } from "react";
import { BusFront, MapPin, Home } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AddressSearch({
  label = "Adres",
  onSelect,
  inputProps = {},
  showLabel = false,
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const isSelectingRef = useRef(false);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const raw = q.trim();

    if (raw.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(() => {
      fetch(`${API_BASE}/api/geocode?q=${encodeURIComponent(raw)}`, {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error(`HTTP error! status: ${r.status}`);
          }
          return r.json();
        })
        .then((results) => {
          setItems(results);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Błąd wyszukiwania:", err);
            setItems([]);
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [q]);

  return (
    <div className="address-search relative w-full">
      {showLabel && (
        <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      )}

      <input
        {...inputProps}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          inputProps.onChange?.(e);
        }}
        onBlur={(e) => {
          setTimeout(() => {
            if (!isSelectingRef.current) setItems([]);
            isSelectingRef.current = false;
          }, 200);
          inputProps.onBlur?.(e);
        }}
        onFocus={inputProps.onFocus}
        placeholder={
          inputProps.placeholder || "Wpisz adres, ulicę lub miejsce"
        }
        className={`w-full ${inputProps.className || ""}`}
      />

      {loading && (
        <div className="absolute mt-1 text-xs text-gray-500">Ładowanie…</div>
      )}

      {items.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded shadow max-h-56 overflow-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.map((it) => {
            const isStop = it.type === 'stop';
            const isAddress = it.type === 'address';
            const isStreet = it.type === 'street';

            return (
              <li
                key={it.uniqueKey}
                className="p-2 hover:bg-slate-100 cursor-pointer text-sm flex items-center gap-2"
                onMouseDown={(e) => {
                  e.preventDefault();
                  isSelectingRef.current = true;
                }}
                onClick={(e) => {
                  e.preventDefault();
                  justSelectedRef.current = true;
                  setQ(it.display_name);
                  setItems([]);
                  isSelectingRef.current = false;
                  onSelect?.({
                    label: it.display_name,
                    lat: Number(it.lat),
                    lon: Number(it.lon),
                  });
                }}
              >
                {isStop && <BusFront className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                {isAddress && <Home className="w-4 h-4 text-green-600 flex-shrink-0" />}
                {isStreet && <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                {!isStop && !isAddress && !isStreet && <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />}

                <div className="flex-1">
                  <span className="block">{it.display_name}</span>
                  {(it.city || it.district) && (
                    <span className="text-xs text-gray-500">
                      {[it.city, it.district].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
