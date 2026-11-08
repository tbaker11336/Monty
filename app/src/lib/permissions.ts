import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { PermissionsAndroid, Platform } from 'react-native';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/** Ask for the microphone. "blocked" means Android will no longer show the prompt. */
export async function requestMicrophone(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'denied';
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}

export async function hasMicrophone(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
}

/**
 * Open Android's "Display over other apps" page for Monty. Resolves when the
 * person comes back. Whether it was granted is checked by the bubble module later.
 */
export async function openOverlaySettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const pkg = Application.applicationId ?? 'com.montyplanner.app';
  try {
    await IntentLauncher.startActivityAsync('android.settings.action.MANAGE_OVERLAY_PERMISSION', {
      data: `package:${pkg}`,
    });
  } catch {
    // Some phones lack the per-app page; fall back to the general list.
    await IntentLauncher.startActivityAsync('android.settings.action.MANAGE_OVERLAY_PERMISSION');
  }
}
