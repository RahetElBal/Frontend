import { useCallback, useEffect, useRef, useState } from "react";
import { useGet } from "@/hooks/useGet";
import type {
  GeoAddress,
  GeoCoordinates,
  PendingGeoAddressRequest,
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

const buildReverseGeocodeUrl = ({ latitude, longitude }: GeoCoordinates) =>
  `${NOMINATIM_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}`;

const mapGeoAddress = (data: ReverseGeocodeResponse): GeoAddress => ({
  displayAddress: data.display_name,
  city: data.address?.city || data.address?.town || data.address?.village,
  postalCode: data.address?.postcode,
  country: data.address?.country,
  region: data.address?.state,
});

export function useDetectAddress() {
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [requestToken, setRequestToken] = useState(0);
  const pendingRequestRef = useRef<PendingGeoAddressRequest | null>(null);

  const query = useGet<ReverseGeocodeResponse, GeoAddress>(
    coords ? buildReverseGeocodeUrl(coords) : `${NOMINATIM_URL}?format=jsonv2`,
    {
      enabled: !!coords,
      retry: false,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select: mapGeoAddress,
    },
  );

  useEffect(() => {
    if (!pendingRequestRef.current || requestToken === 0) {
      return;
    }

    if (query.error) {
      pendingRequestRef.current.reject(query.error);
      pendingRequestRef.current = null;
      return;
    }

    if (!query.isFetching && query.data) {
      pendingRequestRef.current.resolve(query.data);
      pendingRequestRef.current = null;
    }
  }, [requestToken, query.data, query.error, query.isFetching]);

  useEffect(() => {
    return () => {
      if (pendingRequestRef.current) {
        pendingRequestRef.current.reject(
          new Error("Address detection cancelled"),
        );
        pendingRequestRef.current = null;
      }
    };
  }, []);

  const detectAddress = useCallback(async (): Promise<GeoAddress> => {
    if (pendingRequestRef.current) {
      pendingRequestRef.current.reject(
        new Error("Address detection superseded"),
      );
      pendingRequestRef.current = null;
    }

    const nextCoords = await getCurrentPosition();
    setCoords(nextCoords);

    return await new Promise<GeoAddress>((resolve, reject) => {
      pendingRequestRef.current = { resolve, reject };
      setRequestToken((current) => current + 1);
    });
  }, []);

  return {
    ...query,
    detectAddress,
    isDetecting: query.isFetching,
  };
}
