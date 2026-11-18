type ScreenCaptureControlProps = {
  isSaving: boolean;
  message: string;
  onSave: () => void;
};

export function ScreenCaptureControl({ isSaving, message, onSave }: ScreenCaptureControlProps) {
  return (
    <div className="screen-capture-control" data-capture-ignore="true">
      <button
        className="button secondary capture-button"
        type="button"
        onClick={onSave}
        disabled={isSaving}
      >
        화면 저장 <kbd>Ctrl+S</kbd>
      </button>
      <span className="capture-status" aria-live="polite" aria-atomic="true">{message}</span>
    </div>
  );
}
