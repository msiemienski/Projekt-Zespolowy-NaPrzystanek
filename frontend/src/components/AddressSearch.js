"use client";
import React, { useState, useEffect, useRef } from "react";
import { BusFront, MapPin } from "lucide-react";

// Cache dla zapytań
const queryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

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

    if (raw.length < 3) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Sprawdzanie cache
    const cacheKey = raw.toLowerCase();
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setItems(cached.data);
      setLoading(false);
      return;
    }

    const t = setTimeout(() => {
      const otpParams = new URLSearchParams({
        query: raw,
        autocomplete: "true",
        stops: "true",
        clusters: "true",
        corners: "true",
      });

      Promise.allSettled([
        fetch(`http://localhost:8080/otp/geocode?${otpParams.toString()}`, {
          signal: controller.signal,
        })
          .then((r) => {
            if (!r.ok) {
              throw new Error(`HTTP error! status: ${r.status}`);
            }
            return r.json();
          })
          .then((data) => {
            const results = Array.isArray(data) ? data : [];

            return results.map((result, idx) => {
              const lat = result.lat || 0;
              const lng = result.lng || 0;
              const description = result.description || "";
              const id = result.id || `otp-${idx}`;

              let displayName = description.replace(/\s*\(\d+\)\s*$/, "").trim();

              return {
                place_id: id,
                display_name: displayName || "Bez nazwy",
                lat: Number(lat) || 0,
                lon: Number(lng) || 0,
                uniqueKey: `otp-${id}-${idx}`,
                hasStreet: false,
                hasHouseNumber: false,
                isPlace: true,
                isAddress: false,
                isStreet: false,
                name: displayName,
              };
            });
          })
          .catch((err) => {
            console.log("OTP Geocoder błąd:", err.message);
            return [];
          }),
        fetchPhoton(raw, controller),
      ])
          .then(([otpResult, photonResult]) => {
          const allResults = [
            ...(otpResult.status === "fulfilled" ? otpResult.value : []),
            ...(photonResult.status === "fulfilled" ? photonResult.value : [])
          ];

          const normalizeStreetName = (name) => 
            name.toLowerCase().replace(/\s*\(\d+\)\s*$/, "").replace(/\s+\d+\s*$/, "").replace(/\s+/g, " ").trim();
          
          const hasHouseNumber = (name) => /\s+\d+\s*$/.test(name.replace(/\s*\(\d+\)\s*$/, ""));

          // Usuwamy duplikaty ulic (bez numeru), ale zachowujemy adresy z numerami
          const resultsByStreet = new Map();

          allResults.forEach((item) => {
            const normalizedStreet = normalizeStreetName(item.display_name);
            const hasNumber = hasHouseNumber(item.display_name);

            if (!resultsByStreet.has(normalizedStreet)) {
              resultsByStreet.set(normalizedStreet, [item]);
            } else {
              const existingResults = resultsByStreet.get(normalizedStreet);
              
              if (hasNumber) {
                existingResults.push(item);
              } else {
                const existingWithoutNumber = existingResults.find(
                  (r) => !hasHouseNumber(r.display_name)
                );
                
                if (!existingWithoutNumber) {
                  existingResults.push(item);
                } else {
                  const isNewStop = item.uniqueKey.startsWith("otp-");
                  const isExistingStop = existingWithoutNumber.uniqueKey.startsWith("otp-");
                  
                  if (isNewStop && !isExistingStop) {
                    const index = existingResults.indexOf(existingWithoutNumber);
                    existingResults[index] = item;
                  }
                }
              }
            }
          });

          const uniqueResults = Array.from(resultsByStreet.values()).flat();

          const queryLower = raw.toLowerCase().trim();
          const sorted = uniqueResults
            .map((item) => {
              const nameLower = item.display_name.toLowerCase();
              let score = nameLower.startsWith(queryLower) ? 100 
                : nameLower.includes(queryLower) ? 80 
                : (() => {
                    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);
                    const nameWords = nameLower.split(/\s+/);
                    const matchedWords = queryWords.filter((qw) =>
                      nameWords.some((nw) => nw.startsWith(qw) || nw.includes(qw))
                    );
                    return (matchedWords.length / queryWords.length) * 60;
                  })();
              
              if (item.uniqueKey.startsWith("otp-")) score += 10;
              if (item.isStreet) score += 5;
              return { ...item, score };
            })
            .sort((a, b) => {
              if (Math.abs(a.score - b.score) > 5) return b.score - a.score;
              if (a.isStreet !== b.isStreet) return a.isStreet ? -1 : 1;
              if (a.uniqueKey.startsWith("otp-") !== b.uniqueKey.startsWith("otp-")) {
                return a.uniqueKey.startsWith("otp-") ? -1 : 1;
              }
              if (a.isPlace !== b.isPlace) return a.isPlace ? -1 : 1;
              return a.display_name.localeCompare(b.display_name);
            });

          const limitedResults = sorted.slice(0, 10);
          queryCache.set(cacheKey, { data: limitedResults, timestamp: Date.now() });
          if (queryCache.size > 50) {
            queryCache.delete(queryCache.keys().next().value);
          }

          setItems(limitedResults);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Błąd wyszukiwania:", err);
            setItems([]);
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(t);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [q]);

  // Wyszukiwanie miejsc/adresów przez Photon API
  const fetchPhoton = (query, controller) => {
    const photonUrl = "https://photon.komoot.io/api/";
    
    const searchQuery = query.trim();
    
    const params = new URLSearchParams({
      q: searchQuery,
      limit: "15",
    });

    // bbox dla Gdańska
    params.set("bbox", "18.46,54.29,18.77,54.43");

    return fetch(`${photonUrl}?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        const queryLower = query.toLowerCase().trim();
        const features = data?.features || [];

        return features
          .map((feature, idx) => {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];
            
            const displayName = props.housenumber && props.street 
              ? `${props.street} ${props.housenumber}`
              : props.street || props.name || props.label || "";
            
            const nameLower = displayName.toLowerCase();
            const matchesQuery = nameLower.startsWith(queryLower) || nameLower.includes(queryLower);
            const isPOI = props.osm_key && ["amenity", "shop", "tourism", "leisure", "railway", "historic", "culture"].includes(props.osm_key);
            const isStreet = props.osm_key === "highway" || !!props.street;
            const isAddress = !!props.housenumber && !!props.street;

            return {
              place_id: props.osm_id || `photon-${idx}`,
              display_name: displayName,
              lat: Number(coords[1]) || 0,
              lon: Number(coords[0]) || 0,
              uniqueKey: `photon-${props.osm_id || idx}-${idx}`,
              hasStreet: !!props.street,
              hasHouseNumber: !!props.housenumber,
              isPlace: isPOI,
              isAddress: isAddress,
              isStreet: isStreet && !isAddress,
              name: props.name || displayName,
              matchesQuery,
            };
          })
          .filter((item) => item.matchesQuery || item.isStreet || item.isAddress);
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.message?.includes("aborted")) {
          return [];
        }
        console.error("Błąd wyszukiwania Photon:", err.message);
        return [];
      });
  };
  
  

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
            const isStop = it.uniqueKey.startsWith("otp-");
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
                {isStop ? (
                  <BusFront className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <span className="flex-1">{it.display_name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
