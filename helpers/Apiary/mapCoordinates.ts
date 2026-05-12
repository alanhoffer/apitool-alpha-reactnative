import { IApiary } from '../../constants/interfaces/Apiary/IApiary';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = Coordinate & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export const DEFAULT_MAP_REGION: MapRegion = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

export function isValidCoordinate(latitude?: number | string | null, longitude?: number | string | null): boolean {
  const lat = Number(latitude);
  const lon = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat !== 0 &&
    lon !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export function getApiaryCoordinate(apiary: Pick<IApiary, 'latitude' | 'longitude'>): Coordinate | null {
  if (!isValidCoordinate(apiary.latitude, apiary.longitude)) {
    return null;
  }

  return {
    latitude: Number(apiary.latitude),
    longitude: Number(apiary.longitude),
  };
}

export function getApiariesWithCoordinates(apiaries: IApiary[]): IApiary[] {
  return apiaries.filter((apiary) => Boolean(getApiaryCoordinate(apiary)));
}

export function buildRegionForCoordinates(coordinates: Coordinate[], fallback: MapRegion = DEFAULT_MAP_REGION): MapRegion {
  if (coordinates.length === 0) {
    return fallback;
  }

  if (coordinates.length === 1) {
    return {
      ...coordinates[0],
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.08),
    longitudeDelta: Math.max((maxLon - minLon) * 1.6, 0.08),
  };
}
