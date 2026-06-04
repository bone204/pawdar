"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "@/presentation/providers/LanguageProvider";

import { MockPet } from "@/shared/constants/mockPets";

interface RadarMapProps {
  lat: number;
  lng: number;
  isScanning: boolean;
  showPins: boolean;
  mockPets: MockPet[];
  onScanComplete: (foundCount: number) => void;
}

export const RadarMap: React.FC<RadarMapProps> = ({ 
  lat, 
  lng, 
  isScanning, 
  showPins, 
  mockPets, 
  onScanComplete 
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize Leaflet map centered at coordinates
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      minZoom: 14,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Add zoom control at bottom-right
    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  // Effect to enable/disable map interactions during scanning
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isScanning) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
    }
  }, [isScanning]);

  // Effect to add/remove pins on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!showPins) return;

    // Get current bounds of the map viewport
    const bounds = map.getBounds();

    // Filter pets that are inside current map viewport bounds
    const foundPets = mockPets.filter((pet) => bounds.contains([pet.lat, pet.lng]));

    // Notify parent about the count of pets found in viewport
    onScanComplete(foundPets.length);

    // Render custom Leaflet markers with interactive tooltips
    foundPets.forEach((pin) => {
      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center pointer-events-none">
            <span class="absolute inline-flex h-12 w-12 rounded-full bg-primary/20 animate-ping opacity-75"></span>
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-primary/30 animate-pulse"></span>
            <div class="relative h-10 w-10 rounded-full bg-card border-2 border-primary shadow-lg flex items-center justify-center text-xl transition-all duration-300 transform hover:scale-125 hover:rotate-3 select-none">
              ${pin.emoji}
            </div>
          </div>
        `,
        className: "custom-marker-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const tooltipHtml = `
        <div class="flex gap-2.5 items-center min-w-[180px]">
          <div class="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0 select-none">
            ${pin.emoji}
          </div>
          <div class="flex flex-col min-w-0 text-left">
            <span class="text-xs font-black text-foreground truncate leading-none">
              ${pin.name}
            </span>
            <span class="text-[10px] text-muted font-medium truncate mt-1 leading-none">
              ${pin.breed}
            </span>
            <div class="flex items-center gap-1.5 mt-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.5 bg-danger/10 text-danger rounded-sm leading-none shrink-0">
                ${pin.timeAgo}
              </span>
              <span class="text-[9px] font-semibold text-muted leading-none truncate">
                ${pin.distance}
              </span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon })
        .addTo(map)
        .bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -15],
          className: "custom-leaflet-tooltip",
        });

      markersRef.current.push(marker);
    });
  }, [showPins, mockPets, onScanComplete]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default RadarMap;
