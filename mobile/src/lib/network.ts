import NetInfo from "@react-native-community/netinfo";

// Simple synchronous cache updated by the NetInfo listener.
let _isOnline = true;

// We deliberately only treat the device as offline when NetInfo reports an
// explicit `isConnected === false`. On many Android handsets (dual-SIM, no
// Google Play Services) the `isInternetReachable` probe returns false even
// when the connection is perfectly usable — gating on it caused every sync to
// be wrongly deferred with "Offline — sync deferred". When in doubt we attempt
// the request and let it fail naturally.
function toOnline(state: { isConnected: boolean | null }): boolean {
  return state.isConnected !== false;
}

NetInfo.addEventListener((state) => {
  _isOnline = toOnline(state);
});

export function isOnline(): boolean {
  return _isOnline;
}

export async function waitForOnline(timeoutMs = 10_000): Promise<boolean> {
  if (_isOnline) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (toOnline(state)) {
        clearTimeout(timer);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
