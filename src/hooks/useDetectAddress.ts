import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GeoAddress,
  GeoCoordinates,
  ReverseGeocodeResponse,
} from "@/constants/types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const GEOLOCATION_TIMEOUT_MS = 10000;

const getCurrentPosition = async (): Promise<GeoCoordinates> => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: GEOLOCATION_TIMEOUT_MS,
    });
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

const mapGeoAddress = (data: ReverseGeocodeResponse): GeoAddress => ({
  displayAddress: data.display_name,
  city: data.address?.city || data.address?.town || data.address?.village,
  postalCode: data.address?.postcode,
  country: data.address?.country,
  region: data.address?.state,
});

const buildReverseGeocodeUrl = ({ latitude, longitude }: GeoCoordinates) => {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  return url.toString();
};

const getDetectAddressError = async (response: Response): Promise<Error> => {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    const message = payload.error || payload.message;

    if (typeof message === "string" && message.trim() !== "") {
      return new Error(message);
    }
  } catch (error) {
    void error;
  }

  return new Error("Failed to detect address");
};

const fetchReverseGeocode = async (
  coords: GeoCoordinates,
): Promise<GeoAddress> => {
  const response = await fetch(buildReverseGeocodeUrl(coords), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Accept-Language": navigator.language || "en",
    },
  });

  if (!response.ok) {
    throw await getDetectAddressError(response);
  }

  const data = (await response.json()) as ReverseGeocodeResponse;
  return mapGeoAddress(data);
};

export function useDetectAddress() {
  const [data, setData] = useState<GeoAddress | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const detectAddress = useCallback(async (): Promise<GeoAddress> => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (isMountedRef.current) {
      setIsDetecting(true);
      setError(null);
    }

    try {
      const nextCoords = await getCurrentPosition();
      const nextAddress = await fetchReverseGeocode(nextCoords);

      if (isMountedRef.current && requestId === requestIdRef.current) {
        setData(nextAddress);
      }

      return nextAddress;
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error("Failed to detect address");

      if (isMountedRef.current && requestId === requestIdRef.current) {
        setError(nextError);
      }

      throw nextError;
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsDetecting(false);
      }
    }
  }, []);

  return {
    data,
    error,
    detectAddress,
    isDetecting,
    isFetching: isDetecting,
    isLoading: isDetecting,
  };
}
