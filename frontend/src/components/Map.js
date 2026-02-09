"use client";

import { MapContainer, TileLayer, Marker, Tooltip, Popup, ZoomControl, useMapEvents, Polyline } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useState, useEffect } from "react";
import polyline from "@mapbox/polyline";
const tramIcon = L.icon({
  iconUrl: "/icons/tram-stop.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const busIcon = L.icon({
  iconUrl: "/icons/bus-stop.png",
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const TramBusIcon = L.icon({
  iconUrl: "/icons/tram-bus-stop.png",
  iconSize: [35, 35],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Custom markers for start and end locations
const startIcon = L.icon({
  iconUrl: "/icons/start-marker.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40], // anchor at bottom center
  popupAnchor: [0, -40],
});

const endIcon = L.icon({
  iconUrl: "/icons/end-marker.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40], // anchor at bottom center
  popupAnchor: [0, -40],
});
// Map click handler component
function MapEvents({ onMapClick }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      console.log("🗺️ Map clicked at:", { lat, lng });

      if (!onMapClick) {
        console.warn("⚠️ onMapClick handler is not defined!");
        return;
      }

      try {
        console.log("🔍 Fetching nearest location from OTP...");
        const response = await fetch("http://localhost:8080/otp/gtfs/v1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query ($lat: Float!, $lon: Float!) {
                nearest(lat: $lat, lon: $lon, maxDistance: 500, filterByPlaceTypes: [STOP, ADDRESS, STREET]) {
                  edges {
                    node {
                      place {
                        name
                        lat
                        lon
                      }
                      distance
                    }
                  }
                }
              }
            `,
            variables: { lat, lon: lng },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log("📡 OTP Response:", json);

        const edges = json.data?.nearest?.edges;
        let bestMatch = null;

        if (edges && edges.length > 0) {
          // Sort by distance and pick the closest
          bestMatch = edges.sort((a, b) => a.node.distance - b.node.distance)[0].node.place;
          console.log("✅ Found closest location:", bestMatch);
        } else {
          console.warn("⚠️ No nearby locations found within 500m");
          // Still call onMapClick with the exact clicked coordinates
          onMapClick({
            label: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat,
            lon: lng,
          });
          return;
        }

        if (bestMatch) {
          console.log("📍 Calling onMapClick with:", bestMatch);
          onMapClick({
            label: bestMatch.name,
            lat: bestMatch.lat,
            lon: bestMatch.lon,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching address:", error);
        // Fallback: use clicked coordinates
        onMapClick({
          label: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lon: lng,
        });
      }
    },
  });
  return null;
}

// Helper function to get color for each transit mode
function getModeColor(mode, gtfsColor) {
  if (!mode) return '#6b7280';
  const normalizedMode = mode.toUpperCase();

  // 1. Strict priority for common modes to ensure consistency
  if (normalizedMode === 'TRAM') return '#3b82f6'; // blue
  if (normalizedMode === 'WALK') return '#9ca3af'; // gray
  if (normalizedMode === 'BUS') return '#ef4444'; // red

  // 2. Use GTFS color if available for other modes (like Rail, Subway)
  if (gtfsColor) return `#${gtfsColor}`;

  // 3. Fallback for specific modes
  switch (normalizedMode) {
    case 'RAIL':
    case 'SUBWAY':
      return '#eab308'; // yellow/gold
    default:
      return '#6b7280'; // default gray
  }
}

export default function Map({ onMapClick, startLocation, endLocation, selectedTrip, hideMarkers }) {
  const [stops, setStops] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/otp/gtfs/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            stops {
              gtfsId
              name
              lat
              lon
              routes {
                id
                shortName
                mode
              }
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((json) => setStops(json.data.stops))
      .catch((err) => console.error(err));
  }, []);

  return (
    <MapContainer
      center={[54.35, 18.64]}
      zoom={12}
      style={{ height: "100vh", width: "100%", pointerEvents: 'auto' }}
      zoomControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <ZoomControl position="topright" />

      {onMapClick && <MapEvents onMapClick={onMapClick} />}

      {startLocation && (
        <Marker position={[startLocation.lat, startLocation.lon]} icon={startIcon}>
          <Popup>Start: {startLocation.label}</Popup>
        </Marker>
      )}

      {endLocation && (
        <Marker position={[endLocation.lat, endLocation.lon]} icon={endIcon}>
          <Popup>Koniec: {endLocation.label}</Popup>
        </Marker>
      )}

      {/* Render selected trip route */}
      {selectedTrip?.rawItinerary?.legs?.map((leg, idx) => {
        if (!leg.legGeometry?.points) return null;

        try {
          const coordinates = polyline.decode(leg.legGeometry.points);
          // Prioritize strict colors for TRAM/BUS/WALK
          const color = getModeColor(leg.mode, leg.route?.color);

          return (
            <Polyline
              key={`trip-${selectedTrip.id || 'current'}-leg-${idx}`}
              positions={coordinates}
              color={color}
              weight={5}
              opacity={0.8}
            />
          );
        } catch (error) {
          console.error(`Error decoding polyline for leg ${idx}:`, error);
          return null;
        }
      })}

      {!hideMarkers && (
        <MarkerClusterGroup>
          {stops.map((stop) => {
            const hasTram = stop.routes.some((r) => r.mode === "TRAM");
            const hasBus = stop.routes.some((r) => r.mode === "BUS");
            const hasBoth = hasTram && hasBus;
            const icon = hasBoth ? TramBusIcon : hasTram ? tramIcon : hasBus ? busIcon : null;
            if (!icon) return null;

            return (
              <Marker
                key={stop.gtfsId}
                position={[stop.lat, stop.lon]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onMapClick({
                      label: stop.name,
                      lat: stop.lat,
                      lon: stop.lon,
                    });
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <strong>{stop.name}</strong>
                </Tooltip>
                <Popup>
                  <div>
                    <h2>{stop.name}</h2>
                    <p>
                      <strong>ID:</strong> {stop.gtfsId}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
