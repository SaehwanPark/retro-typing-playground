import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { Activity } from "../content/lessons";

type ActivityMenuProps = {
  activities: readonly Activity[];
  selected: string | null;
  onStart: (activity: Activity) => void;
};

export function ActivityMenu({ activities, selected, onStart }: ActivityMenuProps) {
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
    <section className="screen">
      <h1>타자 연습</h1>
      <div className="activity-menu" ref={list} onKeyDown={moveFocus}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            data-activity={activity.id}
            className="lesson-button"
            type="button"
            onClick={() => onStart(activity)}
          >
            <strong>{activity.label}</strong>
            <span aria-hidden="true">↵</span>
          </button>
        ))}
      </div>
      <p className="keys"><kbd>↑</kbd> <kbd>↓</kbd> 선택 <kbd>Enter</kbd> 시작</p>
    </section>
  );
}
