export interface GeoAddress {
  displayAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  region?: string;
}

export async function detectAddress(): Promise<GeoAddress> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
    });
  });

  const { latitude, longitude } = position.coords;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );
  if (!response.ok) {
    throw new Error("Geocoding failed");
  }
  const data = (await response.json()) as {
    display_name?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
  };

  return {
    displayAddress: data.display_name,
    city: data.address?.city || data.address?.town || data.address?.village,
    postalCode: data.address?.postcode,
    country: data.address?.country,
    region: data.address?.state,
  };
}
