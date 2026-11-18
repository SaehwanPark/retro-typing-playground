import { useEffect, useRef } from "react";

export function useFocus<Element extends HTMLElement>(enabled = true) {
  const ref = useRef<Element>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);
  return ref;
}
