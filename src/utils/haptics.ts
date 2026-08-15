/**
 * Safe haptic vibration utility for mobile and touch devices
 * Provides subtle tactile feedback on user interactions.
 */
export function triggerHaptic(durationMs: number = 15): void {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration errors when blocked by browser permissions
    }
  }
}
