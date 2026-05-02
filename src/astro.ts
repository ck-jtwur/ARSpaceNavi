import { Body, Equator, Horizon, Observer } from "astronomy-engine";
import { CelestialCatalogItem, CelestialId, celestialCatalog } from "./celestialCatalog";

export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type HorizontalPosition = {
  azimuth: number;
  altitude: number;
};

export type CelestialBody = CelestialCatalogItem & {
  position: HorizontalPosition;
};

const astronomyBodyMap = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
} as const;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function toHorizontalFromEquatorial(
  rightAscensionHours: number,
  declinationDegrees: number,
  location: GeoLocation,
  date: Date,
): HorizontalPosition {
  const observer = new Observer(location.latitude, location.longitude, 0);
  const horizontal = Horizon(date, observer, rightAscensionHours, declinationDegrees, "normal");

  return {
    azimuth: normalizeDegrees(horizontal.azimuth),
    altitude: horizontal.altitude,
  };
}

function calculateBodyPosition(item: CelestialCatalogItem, location: GeoLocation, date: Date): HorizontalPosition {
  if (item.astronomyBody) {
    const observer = new Observer(location.latitude, location.longitude, 0);
    const equatorial = Equator(astronomyBodyMap[item.astronomyBody], date, observer, true, true);
    const horizontal = Horizon(date, observer, equatorial.ra, equatorial.dec, "normal");

    return {
      azimuth: normalizeDegrees(horizontal.azimuth),
      altitude: horizontal.altitude,
    };
  }

  return toHorizontalFromEquatorial(item.rightAscensionHours ?? 0, item.declinationDegrees ?? 0, location, date);
}

export function calculateCelestialBodies(location: GeoLocation, date = new Date()): CelestialBody[] {
  return celestialCatalog.map((item) => ({
    ...item,
    position: calculateBodyPosition(item, location, date),
  }));
}

export function getBodyById(id: CelestialId, location: GeoLocation, date = new Date()) {
  return calculateCelestialBodies(location, date).find((body) => body.id === id);
}

export function shortestAngleDelta(target: number, current: number): number {
  const delta = normalizeDegrees(target - current);
  return delta > 180 ? delta - 360 : delta;
}
