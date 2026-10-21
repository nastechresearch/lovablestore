"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, LocateFixed, Loader2, MapPin } from "lucide-react";
import {
  SA_PLACES,
  SA_PROVINCES,
  findPlace,
  nearestPlace,
  placesForProvince,
} from "@/lib/sa-locations";

type GeoStatus = "idle" | "locating" | "found" | "error";

export function LocationFields({
  errors,
}: {
  errors?: { city?: string; province?: string; postalCode?: string };
}) {
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const autoPostal = useRef("");

  const places = useMemo(
    () => (province ? placesForProvince(province) : []),
    [province],
  );

  function applyCity(nextCity: string) {
    setCity(nextCity);
    const match = findPlace(nextCity, province);
    if (
      match &&
      match.postalCode &&
      (postalCode === "" || postalCode === autoPostal.current)
    ) {
      setPostalCode(match.postalCode);
      autoPostal.current = match.postalCode;
    }
  }

  function applyProvince(nextProvince: string) {
    setProvince(nextProvince);
    setGeoStatus("idle");
    setGeoMessage(null);
    const elsewhere = SA_PLACES.find(
      (place) => place.name.toLowerCase() === city.trim().toLowerCase(),
    );
    if (elsewhere && elsewhere.province !== nextProvince) {
      setCity("");
      if (postalCode === autoPostal.current) {
        setPostalCode("");
        autoPostal.current = "";
      }
    }
  }

  function locate() {
    setGeoStatus("locating");
    setGeoMessage(null);
    void devicePosition()
      .then((coordinates) => {
        const place = nearestPlace(coordinates.lat, coordinates.lng);
        setProvince(place.province);
        setCity(place.name);
        setPostalCode(place.postalCode);
        autoPostal.current = place.postalCode;
        setGeoStatus("found");
        setGeoMessage(
          `Detected near ${place.name}, ${place.province}. Adjust anything that's off — courier notes help us find the gate.`,
        );
      })
      .catch((error: unknown) => {
        setGeoStatus("error");
        const denied =
          error instanceof Error && error.name === "LocationPermissionDenied";
        setGeoMessage(
          denied
            ? "Location permission was declined. Pick your province and city below."
            : "We couldn't get a location fix. Pick your province and city below.",
        );
      });
  }

  return (
    <>
      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-cream px-3 py-2.5">
        <p className="flex items-center gap-2 text-[10px] leading-relaxed text-stone">
          <MapPin className="size-3.5 text-champagne-dark" aria-hidden />
          Delivering to all 9 provinces · 990+ towns and suburbs
        </p>
        <button
          type="button"
          onClick={locate}
          disabled={geoStatus === "locating"}
          className="inline-flex items-center gap-1.5 border border-line bg-ivory px-3 py-1.5 text-[9px] uppercase tracking-[0.13em] text-ink transition-colors hover:border-oxblood hover:text-oxblood disabled:cursor-wait disabled:opacity-60"
        >
          {geoStatus === "locating" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="size-3.5" aria-hidden />
          )}
          {geoStatus === "locating" ? "Finding you…" : "Use my location"}
        </button>
      </div>

      <AnimatePresence>
        {geoMessage ? (
          <motion.p
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`sm:col-span-2 flex items-start gap-2 text-[10px] leading-relaxed ${
              geoStatus === "found" ? "text-champagne-dark" : "text-oxblood"
            }`}
          >
            {geoStatus === "found" ? (
              <Check className="mt-0.5 size-3 shrink-0" aria-hidden />
            ) : null}
            {geoMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div>
        <label htmlFor="province" className="label">Province</label>
        <select
          id="province"
          name="province"
          autoComplete="address-level1"
          className="field"
          value={province}
          onChange={(event) => applyProvince(event.target.value)}
          required
        >
          <option value="" disabled>Select province</option>
          {SA_PROVINCES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {errors?.province ? (
          <p role="alert" className="mt-1.5 text-[11px] text-oxblood">{errors.province}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="city" className="label">City / suburb</label>
        <input
          id="city"
          name="city"
          autoComplete="address-level2"
          className="field"
          list={province ? "sa-places" : undefined}
          value={city}
          onChange={(event) => applyCity(event.target.value)}
          placeholder={province ? "Start typing, e.g. Sandton" : "Choose a province first"}
          required
        />
        {province ? (
          <datalist id="sa-places">
            {places.map((place) => (
              <option key={`${place.name}-${place.postalCode}`} value={place.name}>
                {place.postalCode ? `${place.postalCode} · ${place.province}` : place.province}
              </option>
            ))}
          </datalist>
        ) : null}
        {errors?.city ? (
          <p role="alert" className="mt-1.5 text-[11px] text-oxblood">{errors.city}</p>
        ) : (
          <p className="mt-1.5 text-[10px] text-stone">
            {province
              ? `${places.length} places in ${province}. Type any suburb if yours isn't listed.`
              : "We deliver across South Africa."}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="postalCode" className="label">Postal code</label>
        <input
          id="postalCode"
          name="postalCode"
          autoComplete="postal-code"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          className="field tabular-nums"
          value={postalCode}
          onChange={(event) => {
            setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 4));
            autoPostal.current = "";
          }}
          placeholder="2196"
          required
        />
        {errors?.postalCode ? (
          <p role="alert" className="mt-1.5 text-[11px] text-oxblood">{errors.postalCode}</p>
        ) : (
          <p className="mt-1.5 text-[10px] text-stone">Filled in when you pick a town. Check it before paying.</p>
        )}
      </div>
    </>
  );
}

type CapacitorWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean };
};

async function devicePosition(): Promise<{ lat: number; lng: number }> {
  const capacitor = (window as CapacitorWindow).Capacitor;
  if (capacitor?.isNativePlatform?.()) {
    const { Geolocation } = await import("@capacitor/geolocation");
    const permission = await Geolocation.requestPermissions();
    if (permission.location !== "granted") {
      const error = new Error("Location permission denied");
      error.name = "LocationPermissionDenied";
      throw error;
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 12_000,
    });
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation unavailable");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => {
        const failure = new Error("Location unavailable");
        if (error.code === error.PERMISSION_DENIED) {
          failure.name = "LocationPermissionDenied";
        }
        reject(failure);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    );
  });
}
