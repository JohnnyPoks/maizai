import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dlog, dlogWarn } from "./debug-store";

const PREF_KEY = "maizai_share_location";

/** Whether the farmer has opted in to attaching location to captures. */
export async function isLocationSharingEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(PREF_KEY)) === "true";
}

export async function setLocationSharingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, enabled ? "true" : "false");
}

export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Returns the current location only if the farmer has opted in AND granted
 * permission. Never throws; returns null on any failure so capture still works.
 */
export async function getCaptureLocation(): Promise<Coords | null> {
  try {
    if (!(await isLocationSharingEnabled())) return null;

    let granted = (await Location.getForegroundPermissionsAsync()).status === "granted";
    if (!granted) {
      granted = (await Location.requestForegroundPermissionsAsync()).status === "granted";
    }
    if (!granted) return null;

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    dlog("location", `Captured at ${pos.coords.latitude}, ${pos.coords.longitude}`);
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (err) {
    dlogWarn("location", `Could not get location: ${err}`);
    return null;
  }
}
