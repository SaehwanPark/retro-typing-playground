import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { downloadScreenCapture } from "../ui/screenCapture";

type CaptureStatus = "idle" | "saving" | "saved" | "failed";

const statusMessages: Record<CaptureStatus, string> = {
  idle: "",
  saving: "화면 저장 중입니다.",
  saved: "화면을 PNG로 저장했습니다.",
  failed: "화면을 저장하지 못했습니다. 다시 시도해 주세요.",
};

export function useScreenCapture(target: RefObject<HTMLElement | null>) {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const saving = useRef(false);

  const save = useCallback(async () => {
    if (saving.current) return;
    const root = target.current;
    if (!root) {
      setStatus("failed");
      return;
    }

    saving.current = true;
    setStatus("saving");
    try {
      await downloadScreenCapture(root);
      setStatus("saved");
    } catch {
      setStatus("failed");
    } finally {
      saving.current = false;
    }
  }, [target]);

  useEffect(() => {
    let composing = false;
    const onCompositionStart = () => { composing = true; };
    const onCompositionEnd = () => { composing = false; };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.ctrlKey || event.altKey || event.metaKey || event.shiftKey ||
        event.code !== "KeyS"
      ) return;
      if (composing || event.isComposing || event.keyCode === 229) return;

      event.preventDefault();
      if (!event.repeat) void save();
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [save]);

  return {
    isSaving: status === "saving",
    message: statusMessages[status],
    save,
  };
}
