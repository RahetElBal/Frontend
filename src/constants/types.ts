export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoAddress {
  displayAddress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  region?: string;
}

export interface ReverseGeocodeResponse {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface PendingGeoAddressRequest {
  resolve: (value: GeoAddress) => void;
  reject: (reason?: unknown) => void;
}
