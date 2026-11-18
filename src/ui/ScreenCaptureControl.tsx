import type { InterfaceText } from "../content/interfaceText";

type ScreenCaptureControlProps = {
  isSaving: boolean;
  status: "idle" | "saving" | "saved" | "failed";
  onSave: () => void;
  copy: InterfaceText;
};

export function ScreenCaptureControl({ isSaving, status, onSave, copy }: ScreenCaptureControlProps) {
  const message = status === "saved" ? copy.screenCaptureSuccess :
    status === "failed" ? copy.screenCaptureError : "";
  return (
    <div className="screen-capture-control" data-capture-ignore="true">
      <button
        className="button secondary capture-button"
        type="button"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? copy.saving : copy.screenCapture} <kbd>Ctrl+S</kbd>
      </button>
      <span className="capture-status" aria-live="polite" aria-atomic="true">{message}</span>
    </div>
  );
}
