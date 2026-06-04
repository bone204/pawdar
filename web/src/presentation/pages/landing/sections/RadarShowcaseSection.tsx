"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { generateMockPets, MockPet } from "@/shared/constants/mockPets";

// Dynamically import RadarMap with SSR disabled to prevent Leaflet window access errors
const RadarMap = dynamic(() => import("./RadarMap"), { ssr: false });

const RadarIcon = () => (
  <svg className="w-5 h-5 animate-pulse text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" strokeWidth="2" className="opacity-20" />
    <circle cx="12" cy="12" r="5" strokeWidth="2" className="opacity-40 animate-pulse" />
    <circle cx="12" cy="12" r="1.5" strokeWidth="2" className="fill-current" />
    <path d="M12 3v18M3 12h18" strokeWidth="1.5" className="opacity-30" strokeLinecap="round" />
  </svg>
);

const ScanningIcon = () => (
  <svg className="w-5 h-5 animate-spin text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" strokeWidth="2" className="opacity-20" />
    <path d="M12 3a9 9 0 0 1 9 9" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const RadarShowcaseSection: React.FC = () => {
  const { t } = useTranslation();
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>({
    lat: 10.776, // Default to Ho Chi Minh City
    lng: 106.700,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [scanFinished, setScanFinished] = useState(false);

  const [mockPets, setMockPets] = useState<MockPet[]>([]);
  const [foundCount, setFoundCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error, using default center:", error);
        }
      );
    }
  }, []);

  // Generate mock pets once map coordinates are set
  useEffect(() => {
    const generated = generateMockPets(mapCoords.lat, mapCoords.lng, 80);
    setMockPets(generated);
  }, [mapCoords.lat, mapCoords.lng]);

  const handleStartScan = () => {
    setIsScanning(true);
    setShowPins(false);
    setScanFinished(false);
    setFoundCount(0);

    setTimeout(() => {
      setIsScanning(false);
      setShowPins(true);
      setScanFinished(true);
    }, 3000);
  };

  return (
    <section className="relative py-20 lg:py-28 select-none bg-radial from-primary/5 via-transparent to-transparent border-b border-border/30 dark:border-border/10 transition-colors duration-300">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 xl:gap-20 items-center">
          
          {/* Left Column: Tech Description & Copywriting */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="section-sub shadow-xs animate-pulse">
              {t("landing.radarBadge")}
            </div>

            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl mt-4 mb-6">
              {t("landing.radarTitle")}
            </h2>

            <p className="section-desc text-base sm:text-lg max-w-xl mb-8">
              {t("landing.radarSubtitle")}
            </p>

            <div className="mt-2 w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-full font-bold px-8 h-14">
                {t("landing.radarCTA")}
              </Button>
            </div>
          </div>

          {/* Right Column: Visual Interactive Simulated Radar */}
          <div className="lg:col-span-7 flex justify-center items-center relative w-full">
            <div className="relative w-full aspect-[16/9] mx-auto rounded-3xl bg-secondary/30 dark:bg-card/50 border border-border/40 dark:border-border/10 overflow-hidden shadow-2xl flex items-center justify-center">
              
              {/* Interactive OpenStreetMap Container */}
              <div className="absolute inset-0 w-full h-full">
                <RadarMap 
                  lat={mapCoords.lat} 
                  lng={mapCoords.lng} 
                  isScanning={isScanning} 
                  showPins={showPins} 
                  mockPets={mockPets}
                  onScanComplete={setFoundCount}
                />
              </div>

              {/* Radar Grid Concentric Circles (Overlayed, click-through allowed via pointer-events-none) */}
              <div className="absolute h-[80%] aspect-square rounded-full border border-dashed border-primary/20 dark:border-primary/10 pointer-events-none z-10" />
              <div className="absolute h-[55%] aspect-square rounded-full border border-dashed border-primary/20 dark:border-primary/10 pointer-events-none z-10" />
              <div className="absolute h-[30%] aspect-square rounded-full border border-dashed border-primary/20 dark:border-primary/10 pointer-events-none z-10" />
              
              {/* Crosshair Axes */}
              <div className="absolute w-full h-[1px] bg-linear-to-r from-transparent via-primary/20 to-transparent pointer-events-none z-10" />
              <div className="absolute h-full w-[1px] bg-linear-to-b from-transparent via-primary/20 to-transparent pointer-events-none z-10" />
              
              {/* Radar Sweeper Line */}
              {isScanning && (
                <div 
                  className="absolute h-[95%] aspect-square rounded-full pointer-events-none animate-[spin_3s_linear_infinite] z-10"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 50%, rgba(201, 109, 46, 0.05) 80%, rgba(201, 109, 46, 0.2) 100%)",
                  }}
                />
              )}

              {/* Status Overlay Box */}
              <div className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-full bg-card/95 backdrop-blur-md border border-border/50 shadow-md flex items-center gap-2.5 select-none pointer-events-none">
                <span className="relative flex h-2 w-2 shrink-0">
                  {isScanning ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                    </>
                  ) : scanFinished ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </>
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-black text-foreground tracking-wider uppercase leading-none whitespace-nowrap">
                  {isScanning
                    ? t("landing.radarScanning")
                    : scanFinished
                    ? (foundCount > 0 
                        ? t("landing.radarFoundCount").replace("{count}", foundCount.toString())
                        : t("landing.radarNoFound"))
                    : t("landing.radarReady")}
                </span>
              </div>

              {/* Scan Control Overlay Button */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center w-[220px]">
                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className={`
                    w-full h-12 rounded-full font-bold text-xs tracking-wider uppercase
                    flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300
                    ${isScanning 
                      ? "bg-black/60 text-warning border border-warning/30 backdrop-blur-md cursor-not-allowed" 
                      : "bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white border border-primary/20 hover:scale-105 active:scale-95 hover:shadow-primary/30"
                    }
                  `}
                >
                  {isScanning ? (
                    <>
                      <ScanningIcon />
                      <span className="animate-pulse">{t("landing.radarScanning")}</span>
                    </>
                  ) : (
                    <>
                      <RadarIcon />
                      <span>{t("landing.radarStartScan")}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
