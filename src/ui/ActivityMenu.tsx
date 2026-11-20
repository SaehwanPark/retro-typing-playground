import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { InterfaceText } from "../content/interfaceText";
type MenuEntry = { id: string; label: string; detail?: string; creditLabel?: string };

type ActivityMenuProps<Entry extends MenuEntry> = {
  activities: readonly Entry[];
  title: string;
  selected: string | null;
  onStart: (activity: Entry) => void;
  onBack?: () => void;
  copy: InterfaceText;
};

export function ActivityMenu<Entry extends MenuEntry>({
  activities, title, selected, onStart, onBack, copy,
}: ActivityMenuProps<Entry>) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buttons = Array.from(list.current?.querySelectorAll("button") ?? []);
    const target = buttons.find((button) => button.dataset.activity === selected) ?? buttons[0];
    target?.focus();
  }, [selected]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
    const current = buttons.findIndex((button) => button === event.target);
    if (current < 0) return;
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    buttons[(current + step + buttons.length) % buttons.length]?.focus();
  }

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.key === "Escape" && !event.nativeEvent.isComposing) onBack?.();
    }}>
      {onBack && <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>}
      <h1>{title}</h1>
      <div className="activity-menu" ref={list} onKeyDown={moveFocus}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            data-activity={activity.id}
            className="lesson-button"
            type="button"
            onClick={() => onStart(activity)}
          >
            <span>
              <strong>{activity.label}</strong>
              {activity.detail && <small>{activity.detail}</small>}
              {activity.creditLabel && <small className="credit">{activity.creditLabel}</small>}
            </span>
            <span aria-hidden="true">↵</span>
          </button>
        ))}
      </div>
      <p className="keys"><kbd>↑</kbd> <kbd>↓</kbd> {copy.select} <kbd>Enter</kbd> {copy.start}</p>
    </section>
  );
}
