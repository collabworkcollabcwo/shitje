import { Alert, Platform } from 'react-native';

// react-native-web ships `Alert.alert` as a no-op, so on the web build every
// Alert silently does nothing (and any OK-button callback never runs). These
// helpers fall back to the browser's native alert/confirm on web and use the
// real RN Alert on phones — so buttons behave the same on computer and phone.

const join = (title: string, message?: string) =>
  [title, message].filter(Boolean).join('\n\n');

export function notify(title: string, message?: string, onClose?: () => void) {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(join(title, message));
    onClose?.();
    return;
  }
  Alert.alert(title, message, onClose ? [{ text: 'OK', onPress: onClose }] : undefined);
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'OK'
) {
  if (Platform.OS === 'web') {
    if ((globalThis as any).confirm?.(join(title, message))) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Anulo', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
