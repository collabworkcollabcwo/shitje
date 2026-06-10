// In-app dialog plumbing. Instead of browser alert()/confirm() popups (or the
// no-op RN-Web Alert), notify()/confirmAction() forward to the <DialogHost />
// overlay mounted in the root layout — a styled, animated dialog that looks
// and behaves the same on the web build and the Android APK.

export interface DialogButton {
  text: string;
  style?: 'primary' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface DialogRequest {
  title: string;
  message?: string;
  buttons: DialogButton[];
}

type DialogPresenter = (request: DialogRequest) => void;

let presenter: DialogPresenter | null = null;

/** Called once by <DialogHost /> when it mounts. */
export function registerDialogPresenter(fn: DialogPresenter | null) {
  presenter = fn;
}

/** Info dialog with a single "Në rregull" button. */
export function notify(title: string, message?: string, onClose?: () => void) {
  if (presenter) {
    presenter({
      title,
      message,
      buttons: [{ text: 'Në rregull', style: 'primary', onPress: onClose }],
    });
  } else {
    // Host not mounted (shouldn't happen) — don't block the flow.
    onClose?.();
  }
}

/** Confirmation dialog: "Anulo" + a destructive action button. */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Po, vazhdo'
) {
  if (presenter) {
    presenter({
      title,
      message,
      buttons: [
        { text: 'Anulo', style: 'cancel' },
        { text: confirmLabel, style: 'destructive', onPress: onConfirm },
      ],
    });
  }
}
