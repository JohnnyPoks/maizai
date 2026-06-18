import NetInfo from "@react-native-community/netinfo";

// Simple synchronous cache updated by the NetInfo listener
let _isOnline = true;

NetInfo.addEventListener((state) => {
  _isOnline = state.isConnected === true && state.isInternetReachable !== false;
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
      if (state.isConnected && state.isInternetReachable !== false) {
        clearTimeout(timer);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
