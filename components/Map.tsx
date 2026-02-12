"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import SunCalc from "suncalc";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { ExternalLink } from "lucide-react";
import { GuideLocation, LocationType } from "@/types/location";
import { getPhotoTip } from "@/lib/placeMeta";

type LanguageMode = "en" | "kh";

const markerColors: Record<LocationType, string> = {
  Temple: "#2563eb",
  Nature: "#16a34a",
  Dining: "#ea580c",
  Shopping: "#7c3aed",
  Museum: "#0d9488",
  Culture: "#c026d3",
};

type MapProps = {
  locations: GuideLocation[];
  activeLoc: GuideLocation | null;
  language: LanguageMode;
  onMapReady?: () => void;
};

const typeLabels: Record<LocationType, { en: string; kh: string }> = {
  Temple: { en: "Temple", kh: "Temple" },
  Nature: { en: "Nature", kh: "Nature" },
  Dining: { en: "Dining", kh: "Dining" },
  Shopping: { en: "Shopping", kh: "Shopping" },
  Museum: { en: "Museum", kh: "Museum" },
  Culture: { en: "Culture", kh: "Culture" },
};

const markerIconCache = new globalThis.Map<string, L.DivIcon>();

function getMarkerIcon(type: LocationType, isActive: boolean): L.DivIcon {
  const key = `${type}-${isActive ? "active" : "default"}`;
  const cached = markerIconCache.get(key);
  if (cached) {
    return cached;
  }

  const color = markerColors[type];
  const size = isActive ? 34 : 26;
  const innerSize = isActive ? 16 : 11;
  const ringOpacity = isActive ? 0.24 : 0.12;

  const icon = L.divIcon({
    className: "sr-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${color};box-shadow:0 0 0 8px rgba(15,23,42,${ringOpacity}),0 10px 24px rgba(15,23,42,0.35);"><span style="width:${innerSize}px;height:${innerSize}px;border-radius:9999px;background:#ffffff;"></span></span>`,
  });

  markerIconCache.set(key, icon);
  return icon;
}

function destinationPoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceKm: number,
): [number, number] {
  const earthRadiusKm = 6371;
  const angularDistance = distanceKm / earthRadiusKm;
  const bearingRad = (bearingDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const endLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  const endLngRad =
    lngRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(endLatRad),
    );

  return [(endLatRad * 180) / Math.PI, (endLngRad * 180) / Math.PI];
}

function toBearingFromSunCalcAzimuth(azimuthRad: number): number {
  const bearing = (azimuthRad * 180) / Math.PI + 180;
  return (bearing + 360) % 360;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 14.7, { duration: 1.15, easeLinearity: 0.25 });
  }, [lat, lng, map]);

  return null;
}

export default function Map({ locations, activeLoc, language, onMapReady }: MapProps) {
  const idealTimeLabel = language === "kh" ? "Ideal time" : "Ideal time";
  const mapLinkLabel = language === "kh" ? "Open Google Maps" : "Go to Google Maps";
  const photoTipLabel = language === "kh" ? "Photo Tip" : "Photo Tip";

  const sunPath = useMemo(() => {
    if (!activeLoc) {
      return null;
    }

    const now = new Date();
    const sunTimes = SunCalc.getTimes(now, activeLoc.lat, activeLoc.lng);
    const sunrisePosition = SunCalc.getPosition(
      sunTimes.sunrise,
      activeLoc.lat,
      activeLoc.lng,
    );
    const sunsetPosition = SunCalc.getPosition(
      sunTimes.sunset,
      activeLoc.lat,
      activeLoc.lng,
    );

    const sunriseBearing = toBearingFromSunCalcAzimuth(sunrisePosition.azimuth);
    const sunsetBearing = toBearingFromSunCalcAzimuth(sunsetPosition.azimuth);

    const startPoint: [number, number] = [activeLoc.lat, activeLoc.lng];
    const sunriseEndPoint = destinationPoint(
      activeLoc.lat,
      activeLoc.lng,
      sunriseBearing,
      2.2,
    );
    const sunsetEndPoint = destinationPoint(
      activeLoc.lat,
      activeLoc.lng,
      sunsetBearing,
      2.2,
    );

    return {
      sunriseLine: [startPoint, sunriseEndPoint] as [number, number][],
      sunsetLine: [startPoint, sunsetEndPoint] as [number, number][],
    };
  }, [activeLoc]);

  return (
    <MapContainer
      center={[13.4125, 103.867]}
      zoom={13.2}
      className="h-full w-full z-0"
      zoomControl={false}
      attributionControl={false}
      whenReady={() => onMapReady?.()}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <ZoomControl position="bottomright" />

      {activeLoc && <RecenterMap lat={activeLoc.lat} lng={activeLoc.lng} />}
      {sunPath && (
        <>
          <Polyline
            positions={sunPath.sunriseLine}
            pathOptions={{ color: "#facc15", weight: 3, opacity: 0.95, dashArray: "7 6" }}
          />
          <Polyline
            positions={sunPath.sunsetLine}
            pathOptions={{ color: "#a855f7", weight: 3, opacity: 0.92, dashArray: "7 6" }}
          />
        </>
      )}

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={getMarkerIcon(loc.type, activeLoc?.id === loc.id)}
        >
          <Popup className="custom-popup">
            <div className="min-w-[176px] p-1.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {typeLabels[loc.type][language]}
              </p>
              <h3 className="font-semibold text-slate-900">
                {language === "kh" ? loc.nameKh : loc.name}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {language === "kh" ? loc.descKh : loc.desc}
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-500">
                {idealTimeLabel}: {loc.bestTime}
              </p>
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                <strong className="font-semibold">📸 {photoTipLabel}:</strong>{" "}
                {getPhotoTip(loc, language)}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                {mapLinkLabel} <ExternalLink size={12} />
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
