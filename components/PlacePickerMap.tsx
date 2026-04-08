'use client';

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type SelectedPoint = {
  latitude: number;
  longitude: number;
};

const markerIcon = L.divIcon({
  className: "fishflow-picker-marker",
  iconSize: [30, 42],
  iconAnchor: [15, 40],
  html: `
    <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 39C15 39 27 25.5 27 16C27 9.37258 21.6274 4 15 4C8.37258 4 3 9.37258 3 16C3 25.5 15 39 15 39Z" fill="#7cb6ff"/>
      <circle cx="15" cy="16" r="5" fill="#07111C"/>
    </svg>
  `,
});

function PickerEvents({
  selectedPoint,
  onSelect,
}: {
  selectedPoint: SelectedPoint | null;
  onSelect: (point: SelectedPoint) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoint) {
      map.setView([selectedPoint.latitude, selectedPoint.longitude], map.getZoom(), { animate: false });
    }
  }, [map, selectedPoint]);

  useMapEvents({
    click(event) {
      onSelect({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export function PlacePickerMap({
  selectedPoint,
  onSelect,
}: {
  selectedPoint: SelectedPoint | null;
  onSelect: (point: SelectedPoint) => void;
}) {
  const center = selectedPoint ? [selectedPoint.latitude, selectedPoint.longitude] : [55.751244, 37.618423];

  return (
    <div className="overflow-hidden rounded-[22px] border border-border-subtle">
      <MapContainer center={center as [number, number]} zoom={12} scrollWheelZoom className="h-56 w-full">
        <PickerEvents selectedPoint={selectedPoint} onSelect={onSelect} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />
        {selectedPoint ? (
          <Marker position={[selectedPoint.latitude, selectedPoint.longitude]} icon={markerIcon} />
        ) : null}
      </MapContainer>
    </div>
  );
}
