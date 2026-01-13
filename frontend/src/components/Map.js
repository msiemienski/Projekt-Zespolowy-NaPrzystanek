"use client";

import { MapContainer, TileLayer, Marker, Tooltip, Popup, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {useState, useEffect } from "react";
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
export default function Map() {
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

      <MarkerClusterGroup>
        {stops.map((stop) => {
          const hasTram = stop.routes.some((r) => r.mode === "TRAM");
          const hasBus = stop.routes.some((r) => r.mode === "BUS");
          const hasBoth = hasTram && hasBus;
          const icon = hasBoth ? TramBusIcon : hasTram ? tramIcon : hasBus ? busIcon : null;
          if (!icon) return null;

          return (
            <Marker key={stop.gtfsId} position={[stop.lat, stop.lon]} icon={icon}>
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
    </MapContainer>
  );
}
